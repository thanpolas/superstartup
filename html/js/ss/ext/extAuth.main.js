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
 * createdate 29/Oct/2010
 */

 /**
  * @fileoverview main file for social integration libraries (auth/share/etc)
  */


goog.provide('ss.ext.auth.Main');
goog.provide('ss.ext.auth.Error');
goog.provide('ss.ext.auth.EventType');

goog.require('ss.Map');
goog.require('ss.user');
goog.require('ss.Module');
goog.require('goog.object');

/**
 *
 * @constructor
 * @extends {ss.Module}
 */
ss.ext.auth.Main = function()
{
  goog.base(this);
};
goog.inherits(ss.ext.auth.Main, ss.Module);
goog.addSingletonGetter(ss.ext.auth.Main);

/**
 * Errors thrown by main external auth class.
 * @enum {string}
 */
ss.ext.auth.Error = {
  /**
   * External auth plugin has already registered
   */
  ALREADY_REGISTERED: 'This ext auth plugin is already registered: ',
  // Instanced passed not an intance of pluginModule
  WRONG_TYPE: 'Not an instance of ss.ext.auth.PluginModule'  
};

/**
 * Events supported by this class and all ext auth plugins
 * All plugin events are propagated to this class instance too
 * @enum {string}
 */
ss.ext.auth.EventType = {
  // Triggers whenever authentication status changes
  AUTHCHANGE: 'authChange',
  // This event must be triggered as soon as we can resolve
  // the auth status on the ext source. If no such functionality
  // is provided by the ext auth API then dummy trigger this
  // event.
  INITIALAUTHSTATUS: 'initialAuthStatus'
};

/**
 * A logger to help debugging
 * @type {goog.debug.Logger}
 * @private
 */
ss.ext.auth.Main.prototype.logger = goog.debug.Logger.getLogger('ss.ext.auth.Main');

/**
 * If we have external sources of authentication
 * @private
 * @type {boolean}
 */
ss.ext.auth.Main.prototype._isExtAuthed = false;

/**
 * This var contains an array of extSource ID
 * values, indicating that we are authed on these
 * external sources
 * @private
 * @type {goog.structs.Map.<ss.user.types.extSourceId, boolean>} bool is always true
 */
ss.ext.auth.Main.prototype._extAuthedSources = new ss.Map();

/**
 * This var contains a map of external sources.
 * The external Sources IDs will be used as keys and the
 * instanciations of the ext auth plugins as values
 * @private
 * @type {goog.structs.Map.<ss.user.types.extSourceId, Object>}
 */
ss.ext.auth.Main.prototype._extSupportedSources = new ss.Map();

/**
 * Registers an external authentication plugin.
 *
 * Right after registration, we start the initial auth check
 * for this source
 *
 * @param {!Object} selfObj the instance of the ext auth plugin
 * @return {void}
 */
ss.ext.auth.Main.prototype.addExtSource = function(selfObj)
{
  this.logger.info('Adding external auth source :' + selfObj.sourceId);
  
  // check if plugin is of right type
  if (!selfObj instanceof ss.ext.auth.PluginModule) {
    throw Error(ss.ext.auth.Error.WRONG_TYPE);
  }
  // check if plugin already registered
  if (this._extSupportedSources.get(selfObj.sourceId)) {
    throw Error(ss.ext.auth.Error.ALREADY_REGISTERED + selfObj.sourceId);
  }

  // add the new plugin to our map
  this._extSupportedSources.set(selfObj.sourceId, selfObj);

  // event listeners
  selfObj.addEventListener(ss.ext.auth.EventType.INITIALAUTHSTATUS, this._initAuthStatus, false, this);
  selfObj.addEventListener(ss.ext.auth.EventType.AUTHCHANGE, this._authChange, false, this);

  // initialize the authentication process for this plugin
  selfObj.initAuthCheck();
};

/**
 * Triggers when a plugin has an initial auth check done
 *
 * @private
 * @param {goog.events.Event} e
 */
ss.ext.auth.Main.prototype._initAuthStatus = function(e)
{
  this.logger.info('init Auth status dispatched From:' + e.target.sourceId + ' Authed:' + e.target.isAuthed());

  // if not authed no need to go further
  if (!e.target.isAuthed()) {
    return;
  }

  // we are authed with that source! Save it to our map
  this._extAuthedSources.set(e.target.sourceId, true);
  
  // check if this auth plugin requires authentication with our server
  e.target.LOCALAUTH && this.verifyExtAuthWithLocal(e.target.sourceId);

  // check if we were in a not authed state and change that
  if (!this._isExtAuthed) {
    this._isExtAuthed = true;
  }
};

/**
 * Triggers when a plugin has an auth change event
 *
 * @private
 * @param {goog.events.Event} e
 */
ss.ext.auth.Main.prototype._authChange = function(e)
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
    if (!this._isExtAuthed) {
      this._isExtAuthed = true;
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
    if (0 === this._extAuthedSources.getCount() && this._isExtAuthed) {
      this._isExtAuthed = false;    
    }
  }
};


/**
 * We will return one external source data object
 * from the user data object provided.
 *
 * Optionaly we may set a preffered source
 *
 * We return an object with these keys:
  [sourceId] => 6
  [extUserId] => 47002318
  [extUrl] => http://twitter.com/thanpolas
  [extUsername] => thanpolas
  [extProfileImageUrl] => 'htpt:/...'

 *
 * @param {Object} userObj The user data object
 * @param {ss.CONSTS.SOURCES} opt_prefferedSource
 * @return {Object}
 */
ss.ext.auth.Main.prototype.getUserExt = function(userObj, opt_prefferedSource)
{
  var prefSource = opt_prefferedSource || ss.CONSTS.SOURCES.FB;
  var extObj = {};
  var foundPref = false;

  if (!goog.isArray(userObj.extSource)) {
    // got a broken object...
    var user = ss.user.getDummyObject();
    return user.extSource[0];
  }

  goog.array.forEach(userObj.extSource, function (extSource, index){
    if (foundPref) return;
    extObj =  ss.copy(extSource);
    if (prefSource == extSource.sourceId)
      foundPref = true;
  });

  return extObj;
};

/**
 * Checks if we are authed for a specified
 * external source.
 *
 * @param {ss.user.types.extSourceId} sourceId
 * @return {boolean}
 */
ss.ext.auth.Main.prototype.isSourceAuthed = function (sourceId)
{
  return this._extAuthedSources.containsKey(sourceId);
};

/**
 * Checks if we are authed with any external source.
 *
 * @return {boolean}
 */
ss.ext.auth.Main.prototype.isAuthed = function (sourceId)
{
  return this._isExtAuthed;
};

/**
 * Get the external sources that we
 * are currently authenticated at
 *
 * @return {Array.<ss.user.types.extSourceId>}
 */
ss.ext.auth.Main.prototype.getAuthedSources = function ()
{
    return this._extAuthedSources.getKeys();
};

/**
 * Log out the user from all external sources
 *
 * @return {void}
 */
ss.ext.auth.Main.prototype.logout = function ()
{
  var counter = 0;
  this._extAuthedSources.forEach(function(key, value){
    this._extSupportedSources.get(key).logout();
    counter++;
  }, this);
  this.logger.info('Logged out total external auth sources:' + counter);
  this._clear();
};

/**
 * Call this method whenever we want to clear the data objects
 * because of a logout action...
 * @private
 * @return {void}
 */
ss.ext.auth.Main.prototype._clear = function ()
{
  this._extAuthedSources.clear();

  this._isExtAuthed = false;

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
ss.ext.auth.Main.prototype.verifyExtAuthWithLocal = function (sourceId)
{
  if (!ss.conf.auth.ext.performLocalAuth) {
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
  a.callback = s; //callback of AJAX

  //send the query
  a.send();

};
