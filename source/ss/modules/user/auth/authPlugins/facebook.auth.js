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
goog.provide('ss.user.auth.Facebook');
goog.provide('ss.user.auth.Facebook.EventType');

goog.require('ss.user.auth.PluginModule');
goog.require('ss.user.Auth');
goog.require('ss.user.auth.EventType');

/**
 * The Facebook auth constructor
 *
 * @constructor
 * @implements {ss.user.auth.PluginInterface}
 * @extends {ss.user.auth.PluginModule}
 */
ss.user.auth.Facebook = function()
{
  goog.base(this);

  /** @const {boolean} */
  this.LOCALAUTH = true;

  // set required confs
  this.config('app_id', '');
  this.config('permissions', '');
  // If this is set to false, we assume that the FB JS API was loaded
  // synchronously
  this.config('loadFBjsAPI', true);
  this.config('jsAPI', 'connect.facebook.net/en_US/all.js');
  this.config('jsAPIdebug', 'static.ak.fbcdn.net/connect/en_US/core.debug.js');

  // register our configuration
  ss.Config.getInstance().register(ss.user.auth.Facebook.CONFIG_PATH, this.config());

  /**
   * @type {string?}
   * @private
   */
  this._appId;

  // register ourselves to main external auth class
  this._auth.addExtSource(this);
};
goog.inherits(ss.user.auth.Facebook, ss.user.auth.PluginModule);
goog.addSingletonGetter(ss.user.auth.Facebook);

/**
 * String path that we'll store the config
 * @const {string}
 */
ss.user.auth.Facebook.CONFIG_PATH = 'user.auth.ext.fb';


/**
 * Special events dispatched by this plugin
 * @enum {string}
 */
ss.user.auth.Facebook.EventType = {
  JSAPILOADED: 'user.facebook.jsAPIloaded'
};

/**
 * A logger to help debugging
 * @type {goog.debug.Logger}
 * @private
 */
ss.user.auth.Facebook.prototype.logger =  goog.debug.Logger.getLogger('ss.user.auth.Facebook');

/**
 * @type {boolean} FB JS API is loading...
 * @private
 */
ss.user.auth.Facebook.prototype._FBAPILoading = false;

/**
 * @type {boolean} FB JS API is loaded
 * @private
 */
ss.user.auth.Facebook.prototype._FBAPILoaded = false;

/**
 * @type {boolean} FB JS API has initialized successfully
 * @private
 */
ss.user.auth.Facebook.prototype._FBAPIInited = false;

/**
 * @type {boolean} Got initial auth response from FB
 * @private
 */
ss.user.auth.Facebook.prototype._FBGotResponce = false;

/**
 * @const {ss.user.types.extSourceId} The plugin's name (e.g. Facebook)
 */
ss.user.auth.Facebook.prototype.SOURCEID = 'Facebook';

/**
 * Start initial authentication checks
 * When a definitive result is produced, dispatch the INITIALAUTHSTATUS
 * event
 * @param {goog.events.Event=} opt_e Optionally, if FBAPI is not loaded, we
 *      listen for the relevant event
 * @return {void}
 */
ss.user.auth.Facebook.prototype.init = function(opt_e)
{
  this.logger.info('Init init(). FB JS API loaded:' + this._FBAPILoaded);

  // get config parameters and apply them to our local config container
  this._configApply(ss.Config.getInstance().get(ss.user.auth.Facebook.CONFIG_PATH));

  // now that we have the new config check if we already have the API loaded
  if (!this.config('loadFBjsAPI')) {
    // trigger API load manually
    this._extAPIloaded();
  }

  if (!this._FBAPILoaded) {
    // API not loaded yet
    // listen for load event
    // and start async loading of FB JS API
    this.addEventListener(ss.user.auth.Facebook.EventType.JSAPILOADED, this.init, false, this);

    this._loadExtAPI();

    return;
  }

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
ss.user.auth.Facebook.prototype._gotInitialAuthStatus = function (response)
{
  this.logger.info('Init _gotInitialAuthStatus()');

  this._isAuthedFromResponse(response);

  this._FBGotResponce = true;

  this.dispatchEvent(ss.user.auth.EventType.INITIALAUTHSTATUS);
};

/**
 * Returns the Facebook AppId
 * Currently defined in config
 *
 * @private
 * @return {string}
 */
ss.user.auth.Facebook.prototype._getAppId = function ()
{
  return this._appId || (this._appId = this.config('app_id'));
};

/**
 * Will async load the FB JS API
 *
 * @private
 * @return {void}
 */
ss.user.auth.Facebook.prototype._loadExtAPI = function ()
{
  try {
    this.logger.info('Init _loadExtAPI(). FB API Loading:' + this._FBAPILoading + ' Loaded:' + this._FBAPILoaded);

    if (this._FBAPILoaded || this._FBAPILoading) {
      return;
    }

    // If JS API loading is closed by config, we assume the API has been loaded
    // synchronously
    if (!this.config('loadFBjsAPI')) {
      this.logger.warning('JS API load is closed from Config. Assuming API loaded synchronously');
      this.extAPIloaded();
      return;
    }


    // capture FB API Load event
    goog.global['fbAsyncInit'] = goog.bind(this._extAPIloaded, this);

    // request the facebook api
    var e = document.createElement('script');
    var src = document.location.protocol;
    if (ss.DEVEL) {
      src += '//' + this.config('jsAPIdebug');
    } else {
      src += '//' + this.config('jsAPI');
    }
    e['src'] = src;
    e['async'] = true;
    document.getElementById('fb-root').appendChild(e);

  } catch(e){
    ss.error(e);
  }
};

/**
 * Triggered when the async load of FB JS API is finished
 *
 * @private
 */
ss.user.auth.Facebook.prototype._extAPIloaded = function ()
{
  this.logger.info('FB JS API Loaded');
  this._FBAPILoaded = true;

  // attempt to initialize Facebook JS API
  this._FBinit();

  // dispatch js api loaded event
  this.dispatchEvent(ss.user.auth.Facebook.EventType.JSAPILOADED);
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
ss.user.auth.Facebook.prototype._FBinit = function ()
{
  // get app id
  var appId = this._getAppId();
  this.logger.info('Init _FBinit(). FB appId:' + appId);
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
  FB.Event.subscribe('auth.sessionChange', this._sessionChange);
};

/**
 * Session Change event
 *
 * @private
 * @param {Object} response Served from FB SDK
 * @return {void}
 */
ss.user.auth.Facebook.prototype._sessionChange = function (response)
{
  this.logger.info('Init _sessionChange()');
  this._isAuthedFromResponse(response);
    /**
     * response expose:
     *

    session = {
        session_key = 2.nE7AVOAY5BDd9apfn4yAAQ__.3600.1288249200-100001091766371
        uid = 100001091766371
        expires = 1288249200
        secret = ITO3HqGTvylmHuYerITx_g__
        access_token = 119565011437683|2.nE7AVOAY5BDd9apfn4yAAQ__.3600.1288249200-100001091766371|PHzP-T8P8mAq5-eMNUbha6ZjdzY
        sig = 58c78d0312a0419b553be394a73c801f
    }
    // The status of the User. One of connected, notConnected or unknown.
    status = connected
    perms = publish_stream,email,user_about_me,user_website,user_checkins

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
ss.user.auth.Facebook.prototype.login = function(opt_callback, opt_perms)
{
  this.logger.info('Init login()');

  var callback = opt_callback || function (){};

  var paramObj = {
    perms: opt_perms || this.config('permissions')
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
ss.user.auth.Facebook.prototype._loginListener = function (response, callback)
{
  this.logger.info('Init _loginListener()');

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
ss.user.auth.Facebook.prototype._isAuthedFromResponse = function(response)
{
  try {
  this.logger.info('Init _isAuthedFromResponse(). Deep expose of response:' + goog.debug.deepExpose(response, false, true)  );

  var isAuthed = 'connected' == response['status'];

  // check if the response received differs from our stored state
  if (isAuthed != this._isAuthed) {
    this._isAuthed = isAuthed;
    // only dispatch EXTAUTHCHANGE event AFTER we got initial auth response
    this._FBGotResponce && this.dispatchEvent(ss.user.auth.EventType.EXTAUTHCHANGE);
  }

  return isAuthed;

  } catch(e) {
    ss.error(e);
    return false;
  }
};

/**
* Perform a logout action
*
* @return {void}
*/
ss.user.auth.Facebook.prototype.logout = function()
{
  this.logger.info('Init logout()');
  this._isAuthed = false;
  this.dispatchEvent(ss.user.auth.EventType.EXTAUTHCHANGE);
  FB.logout(function(response) {
    this.logger.info('Logout callback. Deep expose of response:' + goog.debug.deepExpose(response, false, true));
  });
};

/**
 * If user is authed returns us a {@link ss.user.types.extSource}
 * data object
 * @return {ss.user.types.extSource|null} null if not authed
 */
ss.user.auth.Facebook.prototype.getUser = function()
{

};


