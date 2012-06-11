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
goog.provide('ss.user.Auth.EventType');

goog.require('ss.Module');
goog.require('ss.user.Item');
goog.require('ss.ext.auth.Main');
goog.require('ss.ext.auth.EventType');
goog.require('ss.user.types');

/**
 * User authentication class
 *
 * @constructor
 * @extends {ss.Module}
 */
ss.user.Auth = function()
{
  goog.base();

  /**
   * @type {boolean}
   * @private
   */
  this._isAuthed = false;

  /**
   * The user data object
   * @type {ss.user.Item}
   * @private
   */
  this._user = new ss.user.Item();
  // extend our data object with the own user key/value pairs
  this._user.addAll(ss.user.types.ownuser);

  /**
   * The external auth main class
   * @type {ss.ext.auth.Main}
   * @private
   */
  this._ext = ss.ext.auth.Main.getInstance();
  // Add listeners to ext auth events
  this._ext.addEventListener(ss.ext.auth.EventType.INITIALAUTHSTATUS, this._extInitAuth, false, this);
  this._ext.addEventListener(ss.ext.auth.EventType.AUTHCHANGE, this._extAuthChange, false, this);
};
goog.inherits(ss.user.Auth, ss.Module);
goog.addSingletonGetter(ss.user.Auth);

/**
 * Events supported by this class
 * @enum {string}
 */
ss.user.Auth.EventType = {
  // Triggers whenever we have an auth change event
  // (from not authed to authed and vice verca)
  AUTHCHANGE: 'authChange',
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
 * Listener for external (FB, TW ...) initial auth event
 *
 * @private
 * @param {goog.events.Event} e
 */
ss.user.Auth.prototype._extInitAuth = function(e)
{
  this.logger.info('_extInitAuth(). e:' + goog.debug.expose(e));
  goog.global.ee = e;
  
  if (this._isAuthed) {
    return;
  }
  this._isAuthed = true;
  this.dispatchEvent(ss.user.Auth.EventType.AUTHCHANGE);
};

/**
 * Listener for external (FB, TW ...) initial auth event
 *
 * @private
 * @param {goog.events.Event} e
 */
ss.user.Auth.prototype._extAuthChange = function(e)
{
  // nothing changed (!)
  if (this._isAuthed == this._ext.isAuthed()) {
    return;
  }

  this._isAuthed = this._ext.isAuthed();
  this.dispatchEvent(ss.user.Auth.EventType.AUTHCHANGE);
};



/**
 * Perform a user login.
 * We call this function after we have cleared with the authentication
 * procedures.
 *
 * We need a user data object to be provided
 *
 * Your callback fn will be executed as:
 * callback(status, opt_error_msg)
 * status is boolean
 * if false, we get error msg as well for user
 *
 *
 *
 * @param {object} user
 * @param {Function(boolean, string=)=} cb callback function when auth finishes
 * @param {ss.CONSTS.SOURCES=} sourceId the source of authentication, default WEB
 * @return {void}
 */
ss.user.Auth.prototype.login = function(user, opt_cb, opt_sourceId)
 {
   try {
    //shortcut assign
    var logger = goog.debug.Logger.getLogger('ss.user.Auth.prototype.login');
    var genError = 'An error has occured. Please retry';

    logger.info('Init. authed:' + ss.user.db.isAuthed);

    // set default values
    var cb = opt_cb || function(){};
    var sourceId = opt_sourceId || ss.CONSTS.SOURCES.WEB;

    if (ss.user.db.isAuthed) {
      cb(true);
      return;
    }

    // assign the recieved user data object to local db
    ss.user.db.user = user;

    // validate it
    if (!ss.user.isUserObject(ss.user.db.user)) {
        logger.warning('User object provided is not valid:' + goog.debug.expose(user));
        cb(false, genError);
        return;
    }

    // provide new metadata object to our metadata facility
    ss.metadata.init(user['metadataRoot']);

    // turn on authed switch
    ss.user.db.isAuthed = true;

    ss.user.Auth.prototype.events.runEvent('authState', true, sourceId, user);

    // notify metrics
    ss.metrics.userAuth(user);

    cb(true);

    logger.info('Finished');
  } catch(e) {
      ss.error(e);
  }
};

/**
 * Tells us if user is authed
 *
 * @return {boolean}
 */
ss.user.Auth.prototype.isAuthed = function()
 {
    return this._isAuthed;
};
// method ss.user.Auth.prototype.isAuthed

/**
 * Tells us if user if verified
 *
 * @return {boolean}
 */
ss.user.Auth.prototype.isVerified = function()
{
    return this._isAuthed && this._user.get('verified');
};

/**
 * Execute when we have an authentication event
 * from an external source.
 *
 * If we are not authed, we will perform auth procedures
 *
 * @param {ss.CONSTS.SOURCES} sourceId
 * @param {object} user ss user data object verified
 * @return {void}
 */
ss.user.Auth.prototype.extAuth = function(sourceId, user)
 {
    try {
        var logger = goog.debug.Logger.getLogger('ss.user.Auth.prototype.extAuth');

        logger.info('sourceId:' + sourceId + ' authed:' + ss.isAuthed());

        // if already authed exit
        if (ss.isAuthed())
          return;

        // not authed, start auth
        ss.user.Auth.prototype.login(user, function(){}, sourceId);

    } catch(e) {
        ss.error(e);
    }
};
// function ss.user.Auth.prototype.extAuth

/**
 * Lets us know if currently logged in user
 * has external authentication for the provided
 * source id
 *
 * @param {ss.CONSTS.SOURCES} sourceId
 * @return {boolean}
 */
ss.user.Auth.prototype.hasExtSource = function(sourceId)
 {
    try {
        if (!ss.isAuthed())
        return false;

        // get user object
        var user = ss.user.getUserDataObject();

        if (!user['hasExtSource'])
        return false;

        // check for the source defined noc...
        var ind = ss.arFindIndex(user['extSource'], 'sourceId', sourceId);

        if ( -1 == ind)
          return false;


        return true;

    } catch(e) {
        ss.error(e);
    }
};
// function ss.user.Auth.prototype.hasFacebook


/**
 * Gets the external auth source user's name
 *
 * @param {ss.CONSTS.SOURCES.FB} sourceId
 * @return {string|null} null if error / not found
 */
ss.user.Auth.prototype.getExtName = function(sourceId)
 {

    try {
        if (!ss.isAuthed())
          return null;

        // get user object
        var user = ss.user.getUserDataObject();

        if (!user['hasExtSource'])
          return null;

        // check for the source defined noc...
        var ind = ss.arFindIndex(user['extSource'], 'sourceId', sourceId);

        if ( -1 == ind)
          return null;

        // check if name value is there...
        if (goog.isString(user['extSource'][ind]['extUsername']))
        // got it
        return user['extSource'][ind]['extUsername'];

        return null;

    } catch(e) {
        ss.error(e);
    }
};




