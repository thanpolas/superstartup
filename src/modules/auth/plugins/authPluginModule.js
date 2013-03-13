/**
 * @fileoverview The auth plugin superclass.
 */
goog.provide('ssd.user.auth.PluginModule');

goog.require('ssd.Module');
goog.require('ssd.user.Auth');

/**
 * The basic auth plugin class
 *
 * @param {ssd.user.Auth} authInst the auth module capsule.
 * @constructor
 * @extends {ssd.Module}
 */
ssd.user.auth.PluginModule = function( authInst )
{
  goog.base(this);
  /**
   * The user auth Class
   * @protected
   * @type {ssd.user.Auth}
   */
  this._auth = authInst;

  /**
   * @protected
   * @type {boolean} wether the plugin as a JS API.
   */
  this._hasJSAPI = false;

  // set auth main as the parent event target
  this.setParentEventTarget( this._auth );

  /**
   * @type {?string} The access token of the current user.
   * @protected
   */
  this._accessToken = null;

  /**
   * @protected
   * @type {boolean} External source's Auth switch
   */
  this._isAuthed = false;

  /**
   * @type {?Object} udo as provided by the third party,
   *       converted to an object literal.
   * @protected
   */
  this.udo = null;

  /**
   * Used by our instance handlers to know if we have started
   * an auth crosscheck with local (server)
   * @type {boolean}
   */
  this.localAuthInit = false;
};
goog.inherits(ssd.user.auth.PluginModule, ssd.Module);

/**
 * Current user is authenticated with (ext auth source) service
 * @return {boolean}
 */
ssd.user.auth.PluginModule.prototype.isAuthed = function() {
  return this._isAuthed;
};

/**
 * Mock the getAccessToken method. Overwrite if LOCALAUTH
 * is true
 *
 * @protected
 * @return {?string} The oAuth access token
 */
ssd.user.auth.PluginModule.prototype.getAccessToken = function() {
  return this._accessToken;
};

/**
 * @return {string} the ext source id ( plugin name).
 */
ssd.user.auth.PluginModule.prototype.getSourceId = function() {
  return this.SOURCEID;
};

/**
 * @return {boolean}
 */
ssd.user.auth.PluginModule.prototype.hasJSAPI = function() {
  return this._hasJSAPI;
};


/**
 * @return {ssd.user.auth.plugin.Response} a resp object.
 * @protected
 */
ssd.user.auth.PluginModule.prototype._getRespObj = function() {
  var respObj = new ssd.user.auth.plugin.Response();
  respObj.source = this.SOURCEID;
  return respObj;
};



/**
 * Will trigger a BEFORE_EXT_LOGIN event for this plugin.
 *
 * @return {boolean} False if preventDefault() was called.
 * @protected
 */
ssd.user.auth.PluginModule.prototype._beforeLogin = function() {

  var respObj = this._getRespObj();
  respObj.authStatePlugin = this.isAuthed();

  var eventObj = respObj.event(ssd.user.auth.EventType.BEFORE_EXT_LOGIN, this);

  if (false === this.dispatchEvent( eventObj )) {
    return false;
  }
  return true;
};


/**
 * Perform an auth or deauth based on parameter
 *
 * @param {boolean} isAuthed
 * @param  {ssd.user.auth.plugin.Response=}  optRespObj a resp obj to use.
 * @protected
 * @return {when.Promise} a promise.
 */
ssd.user.auth.PluginModule.prototype._doAuth = function (isAuthed, optRespObj) {
  this.logger.info('_doAuth() :: Init. isAuthed:' + isAuthed);

  this._isAuthed = isAuthed;

  if ( !isAuthed ) {
    // clear the dynamic map data object
    this._udo = null;
    this._accessToken = null;
  }

  var respObj = optRespObj || this._getRespObj();
  respObj.authStatePlugin = this._isAuthed;

  var eventObj = respObj.event(ssd.user.auth.EventType.EXT_AUTH_CHANGE, this);

  // add a backpipe so that auth lib can pass back a promise.
  var backPipe = ssd.eventBackPipe( eventObj, when.resolve(respObj) );

  this.dispatchEvent( eventObj );

  return backPipe();
};

/**
 * @return {boolean} If plugin should verify auth with local.
 */
ssd.user.auth.PluginModule.prototype.hasLocalAuth = function() {
  return this.config(ssd.user.auth.config.Key.EXT_SOURCES_TO_LOCAL);
};
