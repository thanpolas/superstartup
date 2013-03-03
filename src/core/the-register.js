/**
 * @fileoverview The modules registry. All modules register here so when app
 *   initializes it knows what is available.
 */
goog.provide('ssd.Register');
goog.provide('ssd.register');

goog.require('goog.array');

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
 * All methods should return a when.Promise
 *
 * @param  {function(...*=):when.Promise} method [description]
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
 * @param  {Function} capsule The result of invocator.
 */
ssd.Register.prototype.runPlugins = function( moduleName, capsule ) {
  if ( !this._plugins[moduleName] ) {
    return;
  }
  if ( !this._plugins[moduleName].length ) {
    return;
  }
  this._invoke( this._plugins[moduleName], {params: [capsule]} );
};

/**
 * Invoke the callbacks of all the modules.
 *
 * @param  {Function} capsule The result of invocator.
 */
ssd.Register.prototype.runModules = function( capsule ) {
  this._invoke( this._modules, {params: [capsule]} );
};

/**
 * Invoke the init methods of all the modules.
 *
 * @return {when.Promise} A promise.
 */
ssd.Register.prototype.runModuleInits = function( ) {
  var def = this._invoke( this._init, {deferred: true} );
  return def;
};

/**
 * Invoke all the functions in an array.
 * @param {Array.<Function>} ar An array of functions.
 * @param {Object=} optParams Parameters to run the invoke.
 * @return {when.Promise} a promise.
 */
ssd.Register.prototype._invoke = function( ar, optParams ) {
  var params = optParams || {};

  var ret = [];
  goog.array.forEach( ar, function( fn ) {
    ret.push( fn.apply(undefined, params.params) );
  }, this);

  if ( true === params.deferred ) {
    return when.all(ret);
  }
};

/**
 * Shortcut assign the singleton instance.
 * @type {ssd.Register}
 */
ssd.register = ssd.Register.getInstance();
