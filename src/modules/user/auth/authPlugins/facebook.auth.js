/**
 * Copyright 2000-2011 Athanasios Polychronakis. Some Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 25/Oct/2010
 *
 *********
 */


/**
 * @fileoverview The main facebook auth functionality
 *
 */
goog.provide('ssd.user.auth.Facebook');
goog.provide('ssd.user.auth.Facebook.EventType');

goog.require('ssd.user.auth.PluginModule');
goog.require('ssd.user.Auth');
goog.require('ssd.user.Auth.EventType');

/**
 * The Facebook auth constructor
 *
 * @constructor
 * @implements {ssd.user.auth.PluginInterface}
 * @extends {ssd.user.auth.PluginModule}
 */
ssd.user.auth.Facebook = function()
{
  this.logger.info('Constructor() :: Init.');
  goog.base(this);

  /** @const {boolean} */
  this.LOCALAUTH = true;

  // set required default configuration values
  this.config('appId', '');
  this.config('permissions', '');
  // If this is set to false, we assume that the FB JS API was loaded
  // synchronously
  this.config('loadFBjsAPI', true);

  // register our configuration
  ssd.Config.getInstance().register(ssd.user.auth.Facebook.CONFIG_PATH, this.config());

  /**
   * @type {string}
   * @private
   */
  this._appId = '';


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
  this._FBGotResponce = false;


  // register ourselves to main external auth class
  this._auth.addExtSource(this);
};
goog.inherits(ssd.user.auth.Facebook, ssd.user.auth.PluginModule);
goog.addSingletonGetter(ssd.user.auth.Facebook);

/**
 * String path that we'll store the config
 * @const {string}
 */
ssd.user.auth.Facebook.CONFIG_PATH = 'user.auth.fb';


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
 * Start initial authentication checks
 * When a definitive result is produced, dispatch the INITIAL_AUTH_STATUS
 * event
 * @param {goog.events.Event=} opt_e Optionally, if FBAPI is not loaded, we
 *      listen for the relevant event
 * @return {void}
 */
ssd.user.auth.Facebook.prototype.init = function(opt_e)
{
  this.logger.info('init() :: Init! FB JS API loaded:' + this._FBAPILoaded);

  // get config parameters and apply them to our local config container
  this._configApply(ssd.Config.getInstance().get(ssd.user.auth.Facebook.CONFIG_PATH));

  if (!this._FBAPILoaded) {
    // API not loaded yet
    // listen for load event
    // and start async loading of FB JS API
    this.addEventListener(ssd.user.auth.Facebook.EventType.JSAPILOADED, this.init, false, this);

    this._loadExtAPI();

    return;
  }

  this.logger.info('init() :: Asking for login status');
  // catch initial login status
  FB.getLoginStatus(goog.bind(this._gotInitialAuthStatus, this));
};

/**
 * Got Initial login status of user from FB
 *
 * @private
 * @param {Object} response
 * @return {void}
 */
ssd.user.auth.Facebook.prototype._gotInitialAuthStatus = function (response)
{
  this.logger.info('_gotInitialAuthStatus() :: init');

  this._isAuthedFromResponse(response);

  this._FBGotResponce = true;

  this.dispatchEvent(ssd.user.Auth.EventType.INITIAL_AUTH_STATUS);
};

/**
 * Returns the Facebook AppId
 * Currently defined in config
 *
 * @private
 * @return {string}
 */
ssd.user.auth.Facebook.prototype._getAppId = function ()
{
  return this._appId || (this._appId = this.config('appId'));
};

/**
 * Will async load the FB JS API
 *
 * @private
 * @return {void}
 */
ssd.user.auth.Facebook.prototype._loadExtAPI = function ()
{
  try {
    this.logger.info('_loadExtAPI() :: Init. FB API Loading:' + this._FBAPILoading + ' Loaded:' + this._FBAPILoaded);

    if (this._FBAPILoaded || this._FBAPILoading) {
      return;
    }

    // capture FB API Load event
    goog.global['fbAsyncInit'] = goog.bind(this._extAPIloaded, this);

    // Check if JS API loading is closed by config.
    if (!this.config('loadFBjsAPI')) {
      this.logger.warning('_loadExtAPI() :: JS API load is closed from Config. Assuming API loaded by user');
      return;
    }

    // request the facebook api
    var d = goog.global.document;
    var scriptId = 'facebook-jssdk';
    if (d.getElementById(scriptId)) {
      // FB API JS Script tag already in DOM
      this.logger.warning('_loadExtAPI() :: FB script tag was found in DOM before we insert our own');
      this._FBAPILoading = true;
      return;
    }
    // Insert the FB API script tag just above the current one
    var scripts = d.getElementsByTagName('script');
    var ownScriptTag = scripts[scripts.length - 1];

    var el = d.createElement('script');
    el['id'] = scriptId;
    el['src'] = "//connect.facebook.net/en_US/all" + (ssd.DEVEL ? "/debug" : "") + ".js";
    el['async'] = true;

    ownScriptTag.parentNode.insertBefore(el, ownScriptTag);

    this._FBAPILoading = true;

  } catch(e){
    ssd.error(e);
  }
};

/**
 * Triggered when the async load of FB JS API is finished
 *
 * @private
 */
ssd.user.auth.Facebook.prototype._extAPIloaded = function ()
{
  this.logger.info('_extAPIloaded() :: FB JS API Loaded');
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
ssd.user.auth.Facebook.prototype._FBinit = function ()
{
  // get app id
  var appId = this._getAppId();
  this.logger.info('_FBinit() :: Init. FB appId:' + appId);
  // check if we have appId set
  if ('' === appId) {
    this.logger.warning('_FBinit:: Facebook application id was not set!');
    throw new Error('FB appId not set');
  }
  var resp = FB.init({
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
ssd.user.auth.Facebook.prototype._sessionChange = function (response)
{
  this.logger.info('_sessionChange() :: Init');
  console.log(response);
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
}; // method _sessionChange


/**
 * Opens the login dialog or starts the authentication flow
 *
 * @param  {Function(boolean)=} opt_callback optional callback
 * @param {string=} opt_perms set permissions if we need to...
 *      comma separate them
 * @return {void}
 */
ssd.user.auth.Facebook.prototype.login = function(opt_callback, opt_perms)
{
  this.logger.info('login() :: init.');

  var callback = opt_callback || function (){};

  var paramObj = {
    'scope': opt_perms || this.config('permissions')
  };

  FB.login(goog.bind(this._loginListener, this, callback), paramObj);
};

/**
 * Facebook Login Listener.
 * We listen for the completion of the fb login modal
 *
 * @private
 * @param {object} response
 * @param {Function(boolean)} callback
 * @return {void}
 */
ssd.user.auth.Facebook.prototype._loginListener = function (response, callback)
{
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

  callback(this._isAuthedFromResponse(response));
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
 * @return {boolean} if we are authed or not
 */
ssd.user.auth.Facebook.prototype._isAuthedFromResponse = function(response)
{
  try {
  this.logger.info('_isAuthedFromResponse() :: Init.');

  var isAuthed = 'connected' == response['status'];

  // check if the response received differs from our stored state
  if (isAuthed != this._isAuthed) {
    this._isAuthed = isAuthed;
    // only dispatch EXT_AUTH_CHANGE event AFTER we got initial auth response
    if (this._FBGotResponce) {
      this.dispatchEvent(ssd.user.Auth.EventType.EXT_AUTH_CHANGE);
    }
  }

  return isAuthed;

  } catch(e) {
    ssd.error(e);
    return false;
  }
};

/**
* Perform a logout action
*
* @return {void}
*/
ssd.user.auth.Facebook.prototype.logout = function()
{
  this.logger.info('logout() :: Init');
  this._isAuthed = false;
  this.dispatchEvent(ssd.user.Auth.EventType.EXT_AUTH_CHANGE);
  FB.logout(function(response) {
    this.logger.info('logout() :: callback. Deep expose of response:' + goog.debug.deepExpose(response, false, true));
  });
};

/**
 * If user is authed returns us a {@link ssd.user.types.extSource}
 * data object
 * @return {ssd.user.types.extSource|null} null if not authed
 */
ssd.user.auth.Facebook.prototype.getUser = function()
{

};

/**
 * @inheritDoc
 */
ssd.user.auth.PluginModule.prototype.getAccessToken = function()
{
  if (!this.isAuthed()) {
    return '';
  }

  return FB.getAccessToken();
};



