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
goog.provide('ss.user.Auth');
goog.provide('ss.user.auth.EventType');
goog.provide('ss.user.auth.Error');

goog.require('ss.Module');
goog.require('ss.DynamicMap');
goog.require('ss.user.types');

/**
 * User authentication class
 *
 * @constructor
 * @extends {ss.Module}
 */
ss.user.Auth = function()
{
  goog.base(this);

  /**
   * @type {boolean}
   * @private
   */
  this._isAuthed = false;

  /**
   * The user data object
   * @type {ss.DynamicMap.<ss.user.types.user>}
   * @private
   */
  this._user = new ss.DynamicMap(ss.user.types.user);
  // extend our data object with the own user key/value pairs
  this._user.addAll(ss.user.types.ownuser);

};
goog.inherits(ss.user.Auth, ss.Module);
goog.addSingletonGetter(ss.user.Auth);


/**
 * Errors thrown by main external auth class.
 * @enum {string}
 */
ss.user.auth.Error = {
  /**
   * External auth plugin has already registered
   */
  ALREADY_REGISTERED: 'This ext auth plugin is already registered: ',
  // Instanced passed not an intance of pluginModule
  WRONG_TYPE: 'Not an instance of ss.ext.auth.PluginModule'
};


/**
 * Events supported for the user auth module
 * @enum {string}
 */
ss.user.auth.EventType = {
  // An external auth source has an auth change event
  // (from not authed to authed and vice verca)
  EXTAUTHCHANGE: 'extAuthChange',
  // We have a global auth change event
  // (from not authed to authed and vice verca)
  // use this eventype for authoritative changes
  AUTHCHANGE: 'authChange',  
  // Trigger this event as soon as we can resolve
  // the auth status from an ext source
  INITIALAUTHSTATUS: 'initialAuthStatus',
  // Triggers if authed user is new, first time signup
  NEWUSER: 'newUser'
};

/**
 * A logger to help debugging
 * @type {goog.debug.Logger}
 * @private
 */
ss.user.Auth.prototype.logger = goog.debug.Logger.getLogger('ss.user.Auth');

/**
 * This var contains an array of extSource ID
 * values, indicating that we are authed on these
 * external sources
 * @private
 * @type {goog.structs.Map.<ss.user.types.extSourceId, boolean>} bool is always true
 */
ss.user.Auth.prototype._extAuthedSources = new ss.Map();

/**
 * This var contains a map of external sources.
 * The external Sources IDs will be used as keys and the
 * instanciations of the ext auth plugins as values
 * @private
 * @type {goog.structs.Map.<ss.user.types.extSourceId, Object>}
 */
ss.user.Auth.prototype._extSupportedSources = new ss.Map();

/**
 * Registers an external authentication plugin.
 *
 * Right after registration, we start the initial auth check
 * for this source
 *
 * @param {!Object} selfObj the instance of the ext auth plugin
 * @return {void}
 */
ss.user.Auth.prototype.addExtSource = function(selfObj)
{
  this.logger.info('Adding auth source:' + selfObj.sourceId);

  // check if plugin is of right type
  if (!selfObj instanceof ss.user.auth.PluginModule) {
    throw Error(ss.user.auth.Error.WRONG_TYPE);
  }
  // check if plugin already registered
  if (this._extSupportedSources.get(selfObj.sourceId)) {
    throw Error(ss.user.auth.Error.ALREADY_REGISTERED + selfObj.sourceId);
  }

  // add the new plugin to our map
  this._extSupportedSources.set(selfObj.sourceId, selfObj);

  // event listeners
  selfObj.addEventListener(ss.user.auth.EventType.INITIALAUTHSTATUS, this._initAuthStatus, false, this);
  selfObj.addEventListener(ss.user.auth.EventType.EXTAUTHCHANGE, this._authChange, false, this);

  // initialize the authentication process for this plugin
  selfObj.initAuthCheck();
};


/**
 * Listener for external (FB, TW ...) initial auth event
 *
 * @private
 * @param {goog.events.Event} e
 */
ss.user.Auth.prototype._initAuthStatus = function(e)
{
  this.logger.info('init Auth status dispatched From:' + e.target.sourceId + ' Source authed:' + e.target.isAuthed());

  // if not authed no need to go further
  if (!e.target.isAuthed()) {
    return;
  }

  // we are authed with that source! Save it to our map
  this._extAuthedSources.set(e.target.sourceId, true);

  // check if this auth plugin requires authentication with our server
  e.target.LOCALAUTH && this.verifyExtAuthWithLocal(e.target.sourceId);

  // check if we were in a not authed state and change that
  if (!this._isAuthed && !ss.conf.auth.performLocalAuth) {
    this._doAuth(true);
  }
};

/**
 * Listener for external (FB, TW ...) initial auth event
 *
 * @private
 * @param {goog.events.Event} e
 */
ss.user.Auth.prototype._authChange = function(e)
{
  this.logger.info('Auth CHANGE dispatched from:' + e.target.sourceId + ' Authed:' + e.target.isAuthed());

  // check if in our authed map
  var inAuthMap = this._extAuthedSources.get(e.target.sourceId);

  if (e.target.isAuthed()) {
    // If authed and we already have it in map then it's a double trigger, ignore
    if (inAuthMap) {
      this.logger.warning('_authChange() BOGUS situation. Received auth event but we already had a record of this source being authed. Double trigger');
      return;
    }

    this._extAuthedSources.set(e.target.sourceId, true);

    // check if this auth plugin requires authentication with our server
    e.target.LOCALAUTH && this.verifyExtAuthWithLocal(e.target.sourceId);

    // check if we were in a not authed state and change that
    if (!this._isAuthed && !ss.conf.auth.performLocalAuth) {
      this._doAuth(true);
    }
  } else {
    // got logged out from ext source
    if (!inAuthMap) {
      this.logger.warning('_authChange() BOGUS situation. Received de-auth event but had no record of being authed');
      return;
    }

    // remove from map
    this._extAuthedSources.remove(e.target.sourceId);

    // check if was last auth source left and we were authed
    if (0 === this._extAuthedSources.getCount() && this._isAuthed) {
      this._doAuth(false);
    }
  }
};

/**
 * When an external auth source changes state and becomes authenticated
 * we use this method to inform the server.
 * If we are not authed, an authentication is performed localy and a native
 * auth session is created, propagating from server back to the client
 *
 * @protected
 * @param {ss.user.types.extSourceId} sourceId
 * @return {void}
 */
ss.user.Auth.prototype.verifyExtAuthWithLocal = function (sourceId)
{
  if (!ss.conf.auth.performLocalAuth) {
    return;
  }

  // get plugin instance
  var extInst = this._extSupportedSources.get(sourceId);

  this.logger.info('Init. _verifyExtAuthWithLocal(). sourceId :' + sourceId + ' Local auth started:' + extInst.localAuthInit);

  //check if we have already started auth with server
  if (extInst.localAuthInit) {
    return;
  }
  extInst.localAuthInit = true;

  // create request
  var a = new ss.ajax(ss.conf.auth.ext.authUrl);
  a.addData(ss.conf.auth.ext.sourceId, sourceId);

  // response from server
  a.callback = goog.bind(this._serverAuthResponse, this); //callback of AJAX

  //send the query
  a.send();
};

/**
 * Callback method for AJAX requests that will result in a
 * user authentication
 *
 * @param {Object} response Response from server
 * @private
 */
ss.user.Auth.prototype._serverAuthResponse = function(response)
{
  this.logger.info('Init _serverAuthResponse(). status:' + response.status);
  
  // if not a positive response, stop
  if (!response.status) {
    return;
  }
  
  //TODO Implement this
};

/**
 * Perform an auth or deauth based on parameter
 *
 * @param {boolean} isAuthed
 * @private
 */
ss.user.Auth.prototype._doAuth = function (isAuthed)
{
  this.logger.info('Init _doAuth(). isAuthed:' + isAuthed);
  this._isAuthed = isAuthed;
  this.dispatchEvent(ss.user.auth.EventType.AUTHCHANGE);
};

/**
 * If current user is authenticated
 *
 * @return {boolean}
 */
ss.user.Auth.prototype.isAuthed = function()
{
    return this._isAuthed;
};

/**
 * If current user is authenticated with specified external 
 * auth source
 *
 * @param {ss.user.types.extSourceId} sourceId
 * @return {boolean}
 */
ss.user.Auth.prototype.isExtAuthed = function(sourceId)
{
    return this._extAuthedSources.get(sourceId) || false;
};

/**
 * Tells us if user is verified
 *
 * @return {boolean}
 */
ss.user.Auth.prototype.isVerified = function()
{
    return this._isAuthed && this._user.get(ss.conf.user.typeMappings.ownuser.verified);
};

/**
 * Logout from all auth sources, clear data objects 
 * and dispose everything
 * @return {void}
 */
ss.user.Auth.prototype.logout = function()
{
  // clear our dynamic map data object
  this._user.clear();
  
  // we used goog.mixin() to do multiple inheritance for
  // events, thus we have to directly call event's disposeInternal
  goog.events.EventTarget.disposeInternal.call(this._user);
  
  this._doAuth(false);
};


