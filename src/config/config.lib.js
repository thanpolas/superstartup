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
 * @param {string=} optPath prepend this path.
 * @constructor
 * @extends {ssd.structs.FancyGetSet}
 */
ssd.Config = function( optPath )
{
  goog.base(this);

  this._path = optPath || '';
  if (this._path.length) {
    this._path += '.';
  }

  /**
   * override the internal storage object.
   * @type {ssd.structs.StringPath}
   * @private
   */
  this._obj = new ssd.structs.StringPath();

  /**
   * override get/toObject methods with the ones
   * from StringPath class
   */
  this.get = goog.bind( this._obj.get, this._obj );
  this.toObject = goog.bind( this._obj.toObject, this._obj );

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
  methodRemoved: 'method not supported'
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

  // check if value is object
  if (goog.isObject(value)) {
    throw new TypeError('value for "' + key + '" cannot be object type');
  }

  // get the value from original config with the throw ReferenceError
  // parameter set to true.
  var val;
  var exists = true;

  /* @preserveTry */
  try {
    val = this._obj.get(key, true);
  } catch(e) {
    exists = false;
  }

  // if the key exists do a type check
  if (exists && goog.typeOf(value) !== goog.typeOf(val)) {
    throw new TypeError('Expected:' + goog.typeOf(val) + ' got:' + goog.typeOf(value) + ' for:' + key);
  }

  // call the original set method
  this._obj.set.call(this._obj, key, value);
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

  var configInst = new ssd.Config( path );

  configInst.set = goog.bind(function( key, value ) {
    return this.set( path + '.' + key, value );
  }, this);

  configInst.get = goog.bind(function( key ) {
    return this.get( path + '.' + key );
  }, this);

  return configInst;
};

/**
 * Add multiple key, value pairs.
 *
 * @param {Object} config An object with key value pairs.
 */
ssd.Config.prototype.addAll = function( config ) {
  this.logger.info('addAll() :: Init. path: ' + this._path);

  goog.object.forEach( config, function( key, value ) {
    this.set( this._path + key, value);
  }, this);
};
