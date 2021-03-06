/**
 * @fileoverview The main facebook auth functionality
 *
 */
goog.provide('ssd.user.auth.Facebook');
goog.provide('ssd.user.auth.Facebook.EventType');

goog.require('ssd.user.auth.PluginModule');
goog.require('ssd.user.auth.plugin.Response');
goog.require('ssd.user.Auth');
goog.require('ssd.user.auth.EventType');
goog.require('ssd.user.auth.config');

/**
 * The Facebook auth constructor
 *
 * @param {ssd.user.Auth} authInst The auth module.
 * @constructor
 * @implements {ssd.user.auth.PluginInterface}
 * @extends {ssd.user.auth.PluginModule}
 */
ssd.user.auth.Facebook = function( authInst ) {
  this.logger.info('ctor() :: Init.');
  goog.base(this, authInst);

  /** @type {ssd.Config} */
  this.config = authInst.config.prependPath( ssd.user.auth.Facebook.CONFIG_PATH );

  // set if a local auth with the server should be performed when this
  // plugin authenticates.
  this.config(ssd.user.auth.config.Key.EXT_SOURCES_TO_LOCAL, true);

  // Default endpoint for facebook auth
  this.config(ssd.user.auth.config.Key.EXT_SOURCES_AUTH_URL,
    '/auth/facebook');

  // set required default configuration values
  this.config(ssd.user.auth.config.Key.FB_APP_ID, '');
  this.config(ssd.user.auth.config.Key.FB_PERMISSIONS, '');
  // If this is set to false, we assume that the FB JS API was loaded
  // synchronously
  this.config(ssd.user.auth.config.Key.FB_LOAD_API, true);

  /** @inheritDoc */
  this._hasJSAPI = true;

  /**
   * @type {string}
   * @private
   */
  this._appId = '';

  /** @type {boolean} ready state */
  this._ready = false;

  /**
   * @type {boolean} FB JS API is loading...
   * @private
   */
  this._FBAPILoading = false;

  /**
   * @type {boolean} FB JS API is loaded
   * @private
   */
  this._FBAPILoaded = false;

  /**
   * @type {boolean} FB JS API has initialized successfully
   * @private
   */
  this._FBAPIInited = false;

  /**
   * @type {boolean} Got initial auth response from FB
   * @private
   */
  this._gotInitialResponse = false;

  // register ourselves to main external auth class
  this._auth.addExtSource(this);

};
goog.inherits(ssd.user.auth.Facebook, ssd.user.auth.PluginModule);

/**
 * String path that we'll store the config
 * @const {string}
 */
ssd.user.auth.Facebook.CONFIG_PATH = 'fb';


/**
 * Special events dispatched by this plugin
 * @enum {string}
 */
ssd.user.auth.Facebook.EventType = {
  JSAPILOADED: 'user.facebook.jsAPIloaded'
};

/**
 * A logger to help debugging
 * @type {goog.debug.Logger}
 * @private
 */
ssd.user.auth.Facebook.prototype.logger =  goog.debug.Logger.getLogger('ssd.user.auth.Facebook');

/**
 * @const {ssd.user.types.extSourceId} The plugin's name (e.g. Facebook)
 */
ssd.user.auth.Facebook.prototype.SOURCEID = 'facebook';

/**
 * Start initial authentication checks.
 *
 * When a definitive result is produced, dispatch the INITIAL_AUTH_STATUS
 * event.
 *
 * @param  {boolean=} optForce Consider that the FB API has loaded and is
 *                             available.
 * @return {when.Promise} a Promise.
 */
ssd.user.auth.Facebook.prototype.init = function(optForce) {
  this.logger.info('init() :: Init! FB JS API loaded:' + this._FBAPILoaded);

  var def = when.defer();
  def.resolve();

  if (optForce) {
    this._FBAPILoaded = true;
  }

  if ( !this._FBAPILoaded ) {
    // API not loaded yet
    // listen for load event
    // and start async loading of FB JS API
    this.addEventListener(ssd.user.auth.Facebook.EventType.JSAPILOADED,
      this.init, false, this);

    this._loadExtAPI();

    return def.promise;
  }

  if ( this._ready ) {
    this.logger.warning('init() :: Double trigger for FB init!');
    return def.reject('double trigger for fb');
  }
  this._ready = true;


  this.logger.info('init() :: Asking for login status');
  // catch initial login status
  FB.getLoginStatus(goog.bind(this._gotInitialAuthStatus, this));

  return def.promise;
};

/**
 * Got Initial login status of user from FB
 *
 * @private
 * @param {Object} response
 * @return {void}
 */
ssd.user.auth.Facebook.prototype._gotInitialAuthStatus = function (response) {
  this.logger.info('_gotInitialAuthStatus() :: init');

  this._isAuthedFromResponse(response);

  this._gotInitialResponse = true;

  this.dispatchEvent(ssd.user.auth.EventType.INITIAL_EXT_AUTH_STATE);
};

/**
 * Returns the Facebook AppId
 * Currently defined in config
 *
 * @private
 * @return {string}
 */
ssd.user.auth.Facebook.prototype._getAppId = function () {
  return this._appId ||
    (this._appId = this.config(ssd.user.auth.config.Key.FB_APP_ID));
};

/**
 * Will async load the FB JS API
 *
 * @private
 * @return {boolean}
 */
ssd.user.auth.Facebook.prototype._loadExtAPI = function () {
  this.logger.info('_loadExtAPI() :: Init. FB API Loading:' + this._FBAPILoading + ' Loaded:' + this._FBAPILoaded);

  if (this._FBAPILoaded || this._FBAPILoading) {
    return false;
  }

  // capture FB API Load event
  goog.global['fbAsyncInit'] = goog.bind(this._extAPIloaded, this);

  // Check if JS API loading is closed by config.
  if (!this.config( ssd.user.auth.config.Key.FB_LOAD_API )) {
    this.logger.warning('_loadExtAPI() :: JS API load is closed from Config. Assuming API loaded by user');
    return false;
  }

  // request the facebook api
  var d = goog.global.document;
  var scriptId = 'facebook-jssdk';
  if (d.getElementById(scriptId)) {
    // FB API JS Script tag already in DOM
    this.logger.warning('_loadExtAPI() :: FB script tag was found in DOM before we insert our own');
    this._FBAPILoading = true;
    return false;
  }
  // Insert the FB API script tag just above the current one
  var scripts = d.getElementsByTagName('script');
  var ownScriptTag = scripts[scripts.length - 1];

  var el = d.createElement('script');
  el['id'] = scriptId;
  el['src'] = '//connect.facebook.net/en_US/all' +
    (ssd.DEVEL ? '/debug' : '') + '.js';
  el['async'] = true;

  ownScriptTag.parentNode.insertBefore(el, ownScriptTag);

  this._FBAPILoading = true;

  return true;
};

/**
 * Triggered when the async load of FB JS API is finished
 *
 * @private
 */
ssd.user.auth.Facebook.prototype._extAPIloaded = function () {
  this.logger.shout('_extAPIloaded() :: FB JS API Loaded');
  this._FBAPILoaded = true;

  // attempt to initialize Facebook JS API
  this._FBinit();

  // dispatch js api loaded event
  this.dispatchEvent(ssd.user.auth.Facebook.EventType.JSAPILOADED);
};

/**
 * Fires when facebook API is ready and loaded
 *
 * We initialize the FB API and register event listeners
 * to FB events related to authentication
 *
 * @private
 * @return {void}
 */
ssd.user.auth.Facebook.prototype._FBinit = function () {
  // get app id
  var appId = this._getAppId();
  this.logger.info('_FBinit() :: Init. FB appId:' + appId);
  // check if we have appId set
  if ('' === appId) {
    this.logger.warning('_FBinit:: Facebook application id was not set!');
    throw new Error('FB appId not set');
  }
  FB.init({
    'appId'  : this._getAppId(),
    'status' : true, // check login status
    'cookie' : true, // enable cookies to allow the server to access the session
    'xfbml'  : true,  // parse XFBML
    'oauth'  : true
  });

  // we initialized
  this._FBAPIInited = true;

  // catch session change events
  FB.Event.subscribe('auth.authResponseChange', goog.bind(this._sessionChange, this));
};

/**
 * Session Change event
 *
 * @private
 * @param {Object} response Served from FB SDK
 * @return {void}
 */
ssd.user.auth.Facebook.prototype._sessionChange = function (response) {
  this.logger.info('_sessionChange() :: Init');
  this._isAuthedFromResponse(response);
    /**
     * response expose:
     *
      authResponse: {
        accessToken: "xxx"
        expiresIn: 5301
        signedRequest: "xxx"
        userID: "99999999"
      }
      // The status of the User. One of connected, notConnected or unknown.
      status: 'connected'
    */
};

/**
 * Opens the login dialog or starts the authentication flow.
 *
 * @param  {Function=} optCb optional callback
 * @param  {Object} optSelf Scope to run callback on.
 * @return {when.Promise} a promise.
 */
ssd.user.auth.Facebook.prototype.login = function(optCb, optSelf) {
  this.logger.info('login() :: init.');
  var def = when.defer();

  var callback = optCb || ssd.noop;

  var paramObj = {
    'scope': this.config(ssd.user.auth.config.Key.FB_PERMISSIONS)
  };

  def.promise.then(
    goog.bind(this._promise2cb, this, callback, optSelf, true),
    goog.bind(this._promise2cb, this, callback, optSelf, false)
  );

  if ( !this._beforeLogin() ) {
    return def.reject('canceled by event');
  }

  var cb = ssd.cb2promise(def, this._loginListener, this);

  FB.login(cb, paramObj);

  return def.promise;
};

/**
 * Convert a promise outcome into a callback.
 *
 * On error the callback expects:
 * 1. string : error message
 * 2. boolean : authState
 *
 * On Success of operation callback expects:
 * 1. null : error message null
 * 2. boolean : authState
 * 3. Object : udo
 * 4. Object|string= : Server response raw
 * 5. Object|string= : Third Party response raw
 *
 * @param  {!Function} cb a function.
 * @param  {Object|undefined} self scope.
 * @param  {boolean} status operation status.
 * @param  {ssd.user.auth.plugin.Response|string=} optRespObj response object or
 *   error message.
 * @private
 */
ssd.user.auth.Facebook.prototype._promise2cb = function(cb, self, status,
  optRespObj) {

  this.logger.finer('_promise2cb() :: Init.');
  var respObj = optRespObj || {};

  if (!status) {
    cb.call(self, respObj, this._auth.isAuthed());
    return;
  }
  cb.call(self,
    null,
    this._auth.isAuthed(),
    this._auth.getSet(),
    respObj.serverRaw,
    respObj.responsePluginRaw
  );
};


/**
 * Facebook Login Listener.
 * Listen for the completion of the fb login modal
 *
 * @private
 * @param {object} response
 * @return {when.Promise}
 */
ssd.user.auth.Facebook.prototype._loginListener = function (response) {
/*  ---response expose---

    response == {
      authResponse: {
        accessToken: "xxx"
        expiresIn: 5685
        signedRequest: "xxx"
        userID: "99999999"
      },
      status: "connected"
    }
*/
  this.logger.info('_loginListener() :: Init');

  var respObj = this._getRespObj();
  respObj.authStatePlugin = this.isAuthed();
  respObj.responsePluginRaw = response;

  var eventObj = respObj.event(ssd.user.auth.EventType.ON_EXT_OAUTH, this);

  if (false === this.dispatchEvent( eventObj )) {
    return when.reject('canceled by on oauth event');
  }

  return this._isAuthedFromResponse(response);
};

/**
 * When an auth event / action is performed FB returns a response
 * object. This object changes from times to times so we have
 * to create this function to rule them all
 *
 * We check the response if we have a successfull authentication
 * and respond acordingly
 *
 * @private
 * @param {object} response the FB response object
 * @return {when.Promise} if we are authed or not
 */
ssd.user.auth.Facebook.prototype._isAuthedFromResponse = function(response) {
  this.logger.info('_isAuthedFromResponse() :: Init.');
  var def = when.defer();

  var respObj = new ssd.user.auth.plugin.Response();

  if ( !goog.isObject(response)) {
    this.logger.warning('_isAuthedFromResponse() :: response not object: ' + response);
    return def.reject('response not an object');
  }

  var isAuthed = 'connected' === response['status'];

  respObj.responsePluginRaw = response;
  respObj.authStatePlugin = isAuthed;
  respObj.source = this.SOURCEID;
  // check if the response received differs from our stored state
  if (isAuthed === this._isAuthed) {
    this.logger.fine('New auth state same as old: ' + isAuthed);
    return def.resolve(respObj);
  }

  this._isAuthed = isAuthed;

  // only dispatch EXT_AUTH_CHANGE events AFTER initial auth response
  if (!this._gotInitialResponse) {
    this.logger.fine('Initial auth response not received yet.');
    return def.resolve(respObj);
  }

  this.logger.info('_isAuthedFromResponse() :: Auth state changed to: ' + isAuthed);

  return this._doAuth(true, respObj);

};

/**
* Perform a logout action
*
* @return {void}
*/
ssd.user.auth.Facebook.prototype.logout = function() {
  this.logger.info('logout() :: Init');

  this._doAuth(false);

  FB.logout(function(response) {
    this.logger.info('logout() :: callback. Deep expose of response:' + goog.debug.deepExpose(response, false, true));
  });
};

/**
 * If user is authed returns the user data object as provided by facebook.
 *
 * @param  {Function=} optCb Callback.
 * @param  {Object} optSelf scope for cb.
 * @return {when.Promise} null if not authed.
 */
ssd.user.auth.Facebook.prototype.getUdo = function(optCb, optSelf) {
  var def = when.defer();

  var cb = optCb || ssd.noop;

  def.promise.then(goog.bind(cb, optSelf), goog.bind(cb, optSelf));

  if ( !this.isAuthed() ) {
    return def.resolve(null);
  }

  if (this.udo) {
    return def.resolve( this.udo );
  }
  FB.api('/me', goog.bind(function(response) {
    if ( goog.isObject( response )) {
      this.udo = response;
      def.resolve(response);
    } else {
      def.reject( response );
    }
  }, this));

  return def.promise;
};

/**
 * @inheritDoc
 */
ssd.user.auth.Facebook.prototype.getAccessToken = function() {
  if (!this.isAuthed()) {
    return null;
  }

  return FB.getAccessToken();
};


