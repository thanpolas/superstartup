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
 * createdate 25/May/2011
 *
 */

/**
 * @fileoverview Handles user authentication
 */
goog.provide('ssd.user.Auth');
goog.provide('ssd.user.auth');
goog.provide('ssd.user.auth.EventType');
goog.provide('ssd.user.auth.Error');

goog.require('ssd.Module');
goog.require('ssd.DynamicMap');
goog.require('ssd.user.types');
goog.require('ssd.Config');
goog.require('ssd.user.OwnItem');

/**
 * User authentication class
 *
 * @constructor
 * @extends {ssd.Module}
 */
ssd.user.Auth = function()
{

  this.logger.info('Class instantiated');

  goog.base(this);

  /**
   * @type {boolean}
   * @private
   */
  this._isAuthed = false;

  /**
   * Config parameters
   */
  // if we'll check auth events of ext sources with our server
  this.config('performLocalAuth', false);

  // The var name to use when (ajax) posting the SOURCEID to the server
  // depends on 'performLocalAuth'
  this.config('localAuthSourceId', 'sourceId');

  // When performing a local authentication we pass the
  // access token to the server so he can validate the
  // authentication. This is the query parameter
  // name
  this.config('localAuthAccessToken', 'accessToken');

  // When an external auth source becomes authenticated
  // we use this URL to inform the server.
  // Depends on 'performLocalAuth'
  //
  // Auth plugins can overwrite this parameter
  this.config('localAuthUrl', '/users/verifyAuth');

  // When we get an authentication response from the server
  // Under which key / path do we expect the user data
  // object to be found?
  this.config('userKey', 'user');

  // In the user object, what is the name of the user's ID?
  this.config('userID', 'id');

  // register our config
  ssd.Config.getInstance().register(ssd.user.auth.CONFIG_PATH, this.config.toObject());

  /**
   * performLocalAuth config parameter is used multiple times
   * we'll use this private symbol to assign it so it can get
   * compressed better by the compiler
   * @private
   * @type {boolean}
   */
  this._localAuth = false;

  /**
   * The user data object
   * @type {ssd.user.OwnItem}
   * @private
   */
  this._user = new ssd.user.OwnItem();
  // pipe the user object events to this class
  this._user.addEventListener(ssd.DynamicMap.EventType.BEFORE_SET, this._dataEvent, false, this);
  this._user.addEventListener(ssd.DynamicMap.EventType.AFTER_SET, this._dataEvent, false, this);
  this._user.addEventListener(ssd.DynamicMap.EventType.BEFORE_ADDALL, this._dataEvent, false, this);
  this._user.addEventListener(ssd.DynamicMap.EventType.AFTER_ADDALL, this._dataEvent, false, this);

  // extend our data object with the own user key/value pairs
  this._user.addAll(ssd.user.types.ownuser);

};
goog.inherits(ssd.user.Auth, ssd.Module);
goog.addSingletonGetter(ssd.user.Auth);


/**
 * String path that we'll store the config
 * @const {string}
 */
ssd.user.auth.CONFIG_PATH = 'user.auth';

/**
 * Errors thrown by main external auth class.
 * @enum {string}
 */
ssd.user.auth.Error = {
  /**
   * External auth plugin has already registered
   */
  ALREADY_REGISTERED: 'plugin already registered: '
};


/**
 * Events supported for the user auth module
 * @enum {string}
 */
ssd.user.auth.EventType = {
  // An external auth source has an auth change event
  // (from not authed to authed and vice verca)
  EXTAUTHCHANGE: 'user.extAuthChange',
  // We have a global auth change event
  // (from not authed to authed and vice verca)
  // use this eventype for authoritative changes
  AUTHCHANGE: 'user.authChange',
  // Trigger this event as soon as we can resolve
  // the auth status from an ext source
  INITIALAUTHSTATUS: 'user.initialAuthStatus',
  // Triggers if authed user is new, first time signup
  NEWUSER: 'user.newUser',
  // before local auth
  BEFORE_LOCAL_AUTH: 'user.beforeLocalAuth',
  // before we process the response object from the AJAX callback
  // of an authentication operation with local server
  BEFORE_AUTH_RESPONSE: 'user.beforeAuthResponse',
  // After the auth response has been processed
  AUTH_RESPONSE: 'user.authResponse',

  // own user data object before validating it's ok
  USERDATA_BEFORE_VALIDATE: 'user.data.beforeValidate',
  // own user data object piped events (piped from DynamicMap)
  BEFORE_SET:    'user.data.beforeSet',
  AFTER_SET:     'user.data.afterSet',
  BEFORE_ADDALL: 'user.data.beforeAddall',
  AFTER_ADDALL:  'user.data.afterAddall'

};

/**
 * A logger to help debugging
 * @type {goog.debug.Logger}
 * @private
 */
ssd.user.Auth.prototype.logger = goog.debug.Logger.getLogger('ssd.user.Auth');

/**
 * This var contains an array of extSource ID
 * values, indicating that we are authed on these
 * external sources
 * @private
 * @type {ssd.Map.<ssd.user.types.extSourceId, boolean>} bool is always true
 */
ssd.user.Auth.prototype._extAuthedSources = new ssd.Map();

/**
 * This var contains a map of external sources.
 * The external Sources IDs will be used as keys and the
 * instanciations of the ext auth plugins as values
 * @private
 * @type {ssd.Map.<ssd.user.types.extSourceId, Object>}
 */
ssd.user.Auth.prototype._extSupportedSources = new ssd.Map();

/**
 * Kicks off authentication flows for all ext auth sources
 *
 * @return {void}
 */
ssd.user.Auth.prototype.init = function()
{
  this.logger.info('user.Auth.init() starting...');
  // get config parameters and apply them to our local config container
  this._configApply(ssd.Config.getInstance().get(ssd.user.auth.CONFIG_PATH));

  // shotcut assign the performLocalAuth config directive to our
  // local var
  this._localAuth = this.config('performLocalAuth');

  this.logger.config('user.Auth.init: Set _localAuth to value:' + this._localAuth);

  this._extSupportedSources.forEach(function(key, plugin){
    plugin.init();
  });

};

/**
 * Listener for data change events in the own user data object
 *
 * We re-emit the event using this classes event types
 *
 * @private
 * @param {goog.events.Event} e
 */
ssd.user.Auth.prototype._dataEvent = function (e)
{
  this.logger.config('_dataEvent event triggered:' + e.type);
  var eventObj = {
    type: null,
    'parentEvent': e
  };

  switch(e.type) {
    case ssd.DynamicMap.EventType.BEFORE_SET:
      eventObj.type = ssd.user.auth.EventType.BEFORE_SET;
    break;
    case ssd.DynamicMap.EventType.AFTER_SET:
      eventObj.type = ssd.user.auth.EventType.AFTER_SET;
    break;
    case ssd.DynamicMap.EventType.BEFORE_ADDALL:
      eventObj.type = ssd.user.auth.EventType.BEFORE_ADDALL;
    break;
    case ssd.DynamicMap.EventType.AFTER_ADDALL:
      eventObj.type = ssd.user.auth.EventType.AFTER_ADDALL;
    break;
  }
  return this.dispatchEvent(eventObj);
};


/**
 * Registers an external authentication plugin.
 *
 * Right after registration, we start the initial auth check
 * for this source
 *
 * @param {!Object} selfObj the instance of the ext auth plugin
 * @return {void}
 */
ssd.user.Auth.prototype.addExtSource = function(selfObj)
{
  this.logger.info('Adding auth source:' + selfObj.SOURCEID);

  // check if plugin is of right type
  if (!selfObj instanceof ssd.user.auth.PluginModule) {
    throw TypeError();
  }
  // check if plugin already registered
  if (this._extSupportedSources.get(selfObj.SOURCEID)) {
    throw Error(ssd.user.auth.Error.ALREADY_REGISTERED + selfObj.SOURCEID);
  }

  // add the new plugin to our map
  this._extSupportedSources.set(selfObj.SOURCEID, selfObj);

  // register the plugin as a method in this instance
  this[selfObj.SOURCEID] = selfObj;

  // event listeners
  selfObj.addEventListener(ssd.user.auth.EventType.INITIALAUTHSTATUS, this._initAuthStatus, false, this);
  selfObj.addEventListener(ssd.user.auth.EventType.EXTAUTHCHANGE, this._authChange, false, this);
};


/**
 * Listener for external (FB, TW ...) initial auth event
 *
 * @private
 * @param {goog.events.Event} e
 */
ssd.user.Auth.prototype._initAuthStatus = function(e)
{
  this.logger.info('initial auth status dispatched From:' + e.target.SOURCEID + ' Source authed:' + e.target.isAuthed() + ' plugin has LocalAuth:' + e.target.LOCALAUTH);

  // if not authed no need to go further
  if (!e.target.isAuthed()) {
    return;
  }

  // we are authed with that source! Save it to our map
  this._extAuthedSources.set(e.target.SOURCEID, true);

  // check if this auth plugin requires authentication with our server
  if (e.target.LOCALAUTH) {
    this.verifyExtAuthWithLocal(e.target.SOURCEID);
  }

  // check if we were in a not authed state and change that
  if (!this._isAuthed && !this._localAuth) {
    this._doAuth(true);
  }
};

/**
 * Listener for external (FB, TW ...) initial auth event
 *
 * @private
 * @param {goog.events.Event} e
 */
ssd.user.Auth.prototype._authChange = function(e)
{
  this.logger.info('Auth CHANGE dispatched from:' + e.target.SOURCEID + ' Authed:' + e.target.isAuthed());

  // check if in our authed map
  var inAuthMap = this._extAuthedSources.get(e.target.SOURCEID);

  if (e.target.isAuthed()) {
    // If authed and we already have it in map then it's a double trigger, ignore
    if (inAuthMap) {
      this.logger.warning('_authChange() BOGUS situation. Received auth event but we already had a record of this source being authed. Double trigger');
      return;
    }

    this._extAuthedSources.set(e.target.SOURCEID, true);

    // check if this auth plugin requires authentication with our server
    if (e.target.LOCALAUTH) {
      this.verifyExtAuthWithLocal(e.target.SOURCEID);
    }

    // check if we were in a not authed state and change that
    if (!this._isAuthed && !this._localAuth) {
      this._doAuth(true);
    }
  } else {
    // got logged out from ext source
    if (!inAuthMap) {
      this.logger.warning('_authChange() BOGUS situation. Received de-auth event but had no record of being authed');
      return;
    }

    // remove from map
    this._extAuthedSources.remove(e.target.SOURCEID);

    // check if was last auth source left and we were authed
    if (0 === this._extAuthedSources.getCount() && this._isAuthed) {
      this._doAuth(false);
    }
  }
};

/**
 * When an external auth source changes state and becomes authenticated
 * we use this method to inform the server.
 *
 * The server will then determine if we are eligible to get authenticated
 * using that provider and if we are, an auth session is created.
 *
 * @protected
 * @param {ssd.user.types.extSourceId} sourceId
 * @return {void}
 */
ssd.user.Auth.prototype.verifyExtAuthWithLocal = function (sourceId)
{
  this.logger.info('Init _verifyExtAuthWithLocal(). LocalAuth Switch:' + this._localAuth + ' sourceId :' + sourceId );

  if (!this._localAuth) {
    return;
  }

  // get plugin instance
  var extInst = this._extSupportedSources.get(sourceId);

  this.logger.info('Check if local auth has already started:' + extInst.localAuthInit);

  //check if we have already started auth with server
  if (extInst.localAuthInit) {
    return;
  }
  extInst.localAuthInit = true;

  // dispatch event and check for cancel...
  var eventObj = {
      type: ssd.user.auth.EventType.BEFORE_LOCAL_AUTH,
      'sourceId': sourceId
    };
  if (!this.dispatchEvent(eventObj)) {
    this.logger.info('verifyExtAuthWithLocal canceled due to event preventDefault');
    return;
  }

  // get local auth url from ext plugin if it exists
  var url = extInst.config('localAuthUrl');
  // get the accessToken
  var accessToken = extInst.getAccessToken();
  // create and start request
  var a = new ssd.ajax(url || this.config('localAuthUrl'), {
      postMethod: ssd.ajax.sendMethods.POST
    });
  a.addData(this.config('localAuthSourceId'), sourceId);
  a.addData(extInst.config('localAuthAccessToken') || this.config('localAuthAccessToken'), accessToken);

  // response from server
  a.callback = goog.bind(this._serverAuthResponse, this); //callback of AJAX

  //send the query
  a.send();
};

/**
 * Callback method for AJAX requests that query the server for
 * the authentication state.
 *
 * This is the main entry point for any type of authentication
 * request to the local server (native or from a provider)
 *
 * In this method we determine if:
 *   1. The operation succeeded
 *   2. We received a positive or negative response from the server
 *
 * We expect:
 *   1. A boolean variable that informs us of the auth state
 *   2. In case we are authenticated a user data object
 *   3. In case we failed an optional error message
 *
 * @param {Object} response Response from server
 * @private
 */
ssd.user.Auth.prototype._serverAuthResponse = function(response)
{
  this.logger.info('Init _serverAuthResponse().');

  var eventObj = {
      type: ssd.user.auth.EventType.BEFORE_AUTH_RESPONSE,
      'response': response,
      'status'  : false,
      'errorMessage': ''
  };
  if (!this.dispatchEvent(eventObj)) {
    this.logger.info('_serverAuthResponse :: canceled due to event preventDefault');
    return;
  }

  // from this point onwards we only emit one type of event:
  eventObj.type = ssd.user.auth.EventType.AUTH_RESPONSE;

  // check if response is an object
  if (ssd.types.OBJECT != goog.typeOf(response)) {
    // error error
    this.logger.warning('_serverAuthResponse :: response is not an object');
    eventObj.errorMessage = 'response not of type Object';
    this.dispatchEvent(eventObj);
    return;
  }

  // get the statusObject
  var statusObject = ssd.helpers.getStatusObject(this.config);

  // check if we have status to check
  if (statusObject.hasStatus) {
    // yes we do... check the response
    if (statusObject.valuator !== response[status]) {
      // operation has failed...
      this.logger.info('_serverAuthResponse :: operation got a false response');
      eventObj.errorMessage = 'server said no dice';
      this.dispatchEvent(eventObj);
      return;
    }
  }

  // we had a successful operation, attempt to fetch the user data object
  var user;
  try {
    user = response[this.config('userKey')];
  } catch(e){}

  // check the user data object is valid
  if (!this._user.validate(user)) {
    this.logger.info('_serverAuthResponse :: not a valid user data object');
    eventObj.errorMessage = 'user data object not valid';
    this.dispatchEvent(eventObj);
    return;
  }

  // all look good
  this._user.addAll(user);
  eventObj.status = true;
  this.dispatchEvent(eventObj);

};

/**
 * Perform an auth or deauth based on parameter
 *
 * @param {boolean} isAuthed
 * @private
 */
ssd.user.Auth.prototype._doAuth = function (isAuthed)
{
  this.logger.info('Init _doAuth(). isAuthed:' + isAuthed);
  this._isAuthed = isAuthed;
  this.dispatchEvent(ssd.user.auth.EventType.AUTHCHANGE);
};

/**
 * If current user is authenticated
 *
 * @return {boolean}
 */
ssd.user.Auth.prototype.isAuthed = function()
{
    return this._isAuthed;
};

/**
 * If current user is authenticated with specified external
 * auth source
 *
 * @param {ssd.user.types.extSourceId} sourceId
 * @return {boolean}
 */
ssd.user.Auth.prototype.isExtAuthed = function(sourceId)
{
  return this._extAuthedSources.get(sourceId) || false;
};

/**
 * Tells us if user is verified
 *
 * @return {boolean}
 */
ssd.user.Auth.prototype.isVerified = function()
{
  return this._isAuthed && this._user.get(ssd.conf.user.typeMappings.ownuser.verified);
};

/**
 * Logout from all auth sources, clear data objects
 * and dispose everything
 * @return {void}
 */
ssd.user.Auth.prototype.logout = function()
{
  // clear our dynamic map data object
  this._user.clear();

  // we used goog.mixin() to do multiple inheritance for
  // events, thus we have to directly call event's disposeInternal
  goog.events.EventTarget.disposeInternal.call(this._user);

  this._doAuth(false);
};


