 /**
  * @fileoverview Configuration Class. Set a default configuration hash,
  *       allow for any type of editing and in the end validate given
  *       configuration
  */
goog.provide('ssd.Config');

goog.require('goog.object');

goog.require('ssd.debug');
goog.require('ssd.structs.FancyGetSet');
goog.require('ssd.structs.StringPath');

goog.require('ssd.invocator');

/**
 * A generic config setter / getter
 *
 * @param {Object|string=} optPath prepend this path or set object as initial data.
 * @param {ssd.Config=} optParent Instance of parent config.
 * @constructor
 * @extends {ssd.structs.FancyGetSet}
 */
ssd.Config = function( optPath, optParent )
{
  goog.base(this);

  // check for object input
  var optData = {};
  if (goog.isObject(optPath)) {
    optData = optPath;
  }

  /** @type {string} */
  this._path = '';
  /** @type {?ssd.Config} */
  this._optParent = optParent || null;

  if (goog.isString(optPath)) {
    this._path = optPath;

    if (this._path.length) {
      this._path += '.';
    }
  }

  /**
   * override the internal storage object.
   * @type {ssd.structs.StringPath}
   * @private
   */
  this._obj = new ssd.structs.StringPath( optData );

  /**
   * And now expose methods from StringPath class to
   * our instance
   */
  this.containsKey = goog.bind( this._obj.containsKey, this._obj );

  return ssd.invocator.encapsulate(this, this.getSet);

};
goog.inherits(ssd.Config, ssd.structs.FancyGetSet);
goog.addSingletonGetter(ssd.Config);

/** @enum {string} Error strings this class throws */
ssd.Config.Error = {
};

/**
 * A logger to help debugging
 * @type {goog.debug.Logger}
 * @private
 */
ssd.Config.prototype.logger =  goog.debug.Logger.getLogger('ssd.Config');


/**
 * Use this setter to setup the original (default) configuration.
 * All key / value pairs passed through this method will
 * validate anything passed via the set() method.
 *
 * This method will also protect you from overwritting previously
 * set paths / keys by throwing an Error
 *
 * @param {string} path a string path
 * @param {Object} objConf an Object with the key/value pairs
 * @return {void}
 */
ssd.Config.prototype.register = function(path, objConf)
{
  this.logger.config('Registering: ' + path);

  /* @preserveTry */
  try {
    this.get(path, true);
    throw new Error('Key / path already exists:' + path);
  } catch(e) {
    // good, doesn't exist, move on
  }

  // set to own map
  this.set(path, objConf);
};

/**
 * Set and do validations:
 * Current validations include:
 * - Type checking. If the set value is of same type as the one set
 *      via this method.
 * - Overwrite checking. We cannot overwrite keys / path
 * - No objects allowed. Objects are not allowed as value
 *
 * @param {string} key The key.
 * @param {*} value we accept any type and validate it.
 * @throws Errors depending on validation checks.
 */
ssd.Config.prototype.set = function(key, value)
{
  this.logger.fine('Setting: ' + key);

  if (this._path.length && this._optParent) {
    return this._optParent.set( this._path + key, value );
  }

  // check if value is object
  if (goog.isObject(value) && !goog.isArray(value)) {
    throw new TypeError('value for "' + key + '" cannot be object type');
  }

  // get the value from original config with the throw ReferenceError
  // parameter set to true.
  var val;
  var exists = true;

  /* @preserveTry */
  try {
    val = this.get(key, true);
  } catch(e) {
    exists = false;
  }

  // if the key exists do a type check
  if (exists && goog.typeOf(value) !== goog.typeOf(val)) {
    throw new TypeError('Expected:' + goog.typeOf(val) + ' got:' + goog.typeOf(value) + ' for:' + key);
  }

  // call the original set method
  this._obj.set(key, value);
};

/**
 * Check if current instance is part of a chain and call parent
 * get or call super's get.
 *
 * A cascading type of getting is implemented. e.g. getting:
 * path.to.the.key, all paths will be cheked down to root 'key':
 * path.to.key
 * path.key
 * key
 *
 * @override
 * @param  {string} key [description]
 * @param  {boolean=} optThrowError [description]
 * @return {*}     [description]
 */
ssd.Config.prototype.get = function( key, optThrowError ) {

  if (this._path.length && this._optParent) {
    return this._optParent.get( this._path + key );
  } else {
    return this._obj.getCascading(key, optThrowError);
  }
};

/**
 * override toObject method
 *
 * @override
 */
ssd.Config.prototype.toObject = function() {

  if (this._path.length && this._optParent) {
    // remove trailing dot
    var pathKey = this._path.substr(0, this._path.length - 1 );
    return this._optParent.get( pathKey );
  } else {
    return this._obj.toObject();
  }

};

/**
 * Prepend a path to all set / get operations.
 *
 * @param  {string} path A namespace path without a trailing dot.
 * @return {ssd.Config} a rigged Config singleton instance.
 */
ssd.Config.prototype.prependPath = function( path ) {
  // chain configs
  path = this._path + path;

  this.logger.info('prependPath() :: Init. path: ' + path);

  var configInst = new ssd.Config( path, this );

  return configInst;
};

/**
 * Add multiple key, value pairs.
 *
 * @param {Object} params An object with key value pairs.
 */
ssd.Config.prototype.addAll = function( params ) {
  this.logger.info('addAll() :: Init. path: ' + this._path);

  goog.object.forEach( params, function( value, key) {
    this.set( key, value);
  }, this);
};
