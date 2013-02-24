/**
 * @fileoverview The modules registry. All modules register here so when app
 *   initializes it knows what is available.
 */
goog.provide('ssd.Register');
goog.provide('ssd.register');

goog.require('goog.array');
goog.require('goog.async.Deferred');

/**
 * The register class.
 * @constructor
 */
ssd.Register = function() {
  /**
   * @type {Array}
   * @private
   */
  this._modules = [];

  /**
   * @type {Array}
   * @private
   */
  this._init = [];

  /**
   * @type {Object}
   * @private
   */
  this._plugins = {};
};
goog.addSingletonGetter(ssd.Register);

/**
 * The main register function.
 *
 * Not a constructor!
 *
 * @param {Function(ssd.Core)} cb The callback to invoke when app initializes.
 */
ssd.Register.prototype.module = function( cb ) {
  this._modules.push( cb );
};

/**
 * Registers the 'init' method of modules. This method is called when the
 * consumer app invokes the ss.init() method.
 *
 * All methods should return a goog.Deferred
 *
 * @param  {function(...*=):goog.Deferred} method [description]
 * @param  {Object=}   optSelf    context to run the callback on.
 */
ssd.Register.prototype.init = function( method, optSelf ) {
  this._init.push( goog.bind( method, optSelf ) );
};

/**
 * Register plugins.
 * @param  {string} moduleName The module's name.
 * @param  {Function} cb The callback to invoke.
 * @param  {Object=}   optSelf    context to run the callback on.
 */
ssd.Register.prototype.plugin = function( moduleName, cb, optSelf) {
  this._plugins[moduleName] = this._plugins[moduleName] || [];
  this._plugins[moduleName].push( goog.bind( cb, optSelf ) );
};

/**
 * Invoke the callbacks of all the plugins that registered for the
 * specified module.
 * @param  {string} moduleName The module's name.
 */
ssd.Register.prototype.runPlugins = function( moduleName ) {
  if ( !this._plugins[moduleName] ) {
    return;
  }
  if ( !this._plugins[moduleName].length ) {
    return;
  }

  this._invoke( this._plugins[moduleName] );
};

/**
 * Invoke the callbacks of all the modules.
 *
 */
ssd.Register.prototype.runModules = function( ) {
  this._invoke( this._modules );
};

/**
 * Invoke the init methods of all the modules.
 *
 * @return {goog.async.Deferred} A deferred.
 */
ssd.Register.prototype.runModuleInits = function( ) {
  return this._invoke( this._init, true );
};

/**
 * Invoke all the functions in an array.
 * @param {Array.<Function>} ar An array of functions.
 * @param {boolean=} optDeferred if funcs return a deferred, honor it.
 * @return {goog.async.Deferred|undefined} nothing or a deferred if opt defined.
 */
ssd.Register.prototype._invoke = function( ar, optDeferred ) {
  var def;

  if ( true === optDeferred ) {
    def = new goog.async.Deferred();
    def.callback();
  }

  var ret;
  goog.array.forEach( ar, function( fn ) {
    ret = fn();
    if ( !!def ) {
      def.awaitDeferred( ret );
    }
  }, this);

  return def;
};

/**
 * Shortcut assign the singleton instance.
 * @type {ssd.Register}
 */
ssd.register = ssd.Register.getInstance();
