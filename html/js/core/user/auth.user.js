/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
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
 *********
 *  File:: user/auth.user.js
 *  Core Auth User file
 *********
 */

goog.provide('core.user.auth');
goog.require('core.events');


/**
 * The core auth events. Everything about authentication is handled from
 * here.
 *
 * Valid events are, along with their parameters:
 *
 * authState (state{boolean}, opt_sourceId{core.STATIC.SOURCES=}, opt_userDataObject{object=})
 *      Whenever auth state changes, this event is triggered. facebook but
 *      state {boolean} :: Tells us if authed or not
 *      opt_sourceId :: The auth source in case of authed
 *      opt_userDataObjet :: In case of auth, the user data object
 * newUser (sourceId{core.STATIC.SOURCES}, userDataObject{object})
 *      If the authed user is a new user
 * initAuthState (state{boolean})
 *      Fired when initial check with external auth sources has finished.
 *
 */
core.user.auth.events = new core.events.listeners();

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
 * @param {Function(boolean, opt_string)} cb callback function when auth finishes
 * @param {core.STATIC.SOURCES} sourceId the source of authentication
 * @return {void}
 */
core.user.auth.login = function(user, cb, sourceId)
 {
   try {
    //shortcut assign
    var c = core;
    var u = c.user;
    var db = u.db;
    var g = goog;
    var log = c.log('core.user.auth.login');
    var genError = 'An error has occured. Please retry';

    log.info('Init. authed:' + db.isAuthed);

    if (db.isAuthed) {
      cb(true);
      return;
    }

    // assign the recieved user data object to local db
    db.user = user;

    // validate it
    if (!c.user.isUserObject(db.user)) {
        log.warning('User object provided is not valid:' + g.debug.expose(user));
        cb(false, genError);
        return;
    }

    // provide new metadata object to our metadata facility
    c.metadata.newObject(user['metadataObject']);

    // turn on authed switch
    db.isAuthed = true;

    // initialize notifications for user
    c.user.notify.Init();

    c.user.auth.events.runEvent('authState', true, sourceId, user);


    // notify our analytics
    c.analytics.userAuth(user);

    cb(true);

    log.info('Finished');
  } catch(e) {
      core.error(e);
  }
};
// method core.user.auth.loginManual

/**
 * Tells us if user is authed
 *
 * @return boolean
 */
core.user.auth.isAuthed = function()
 {
    return core.user.db.isAuthed;
};
// method core.user.auth.isAuthed

/**
 * Tells us if user if verified
 *
 * @return boolean
 */
core.user.auth.isVerified = function()
 {
    return core.user.db.user.verified;
};
// method core.user.auth.isVerified
/**
 * Tells us if the user has perm login credentials
 * stored
 *
 * @return {boolean}
 */
core.user.auth.isPerm = function()
{
    return core.user.db.permLogin;
};

/**
 * Returns the permanent login server cookie object
 *
 * permCook Object schema:
     token = "fdaabfc8d47286424445d10b9213ae608f8d072e0b97d3175e46802fac16fe16"
     uid = "babbos"
     timeset = 1284027551
     permId = 50
     duration = 1318587551
     cookieDomain = ".core.local"
     cookieName = "cookie_perm"
 *
 * @return {string}
 */
core.user.auth.getPerm = function()
 {
    return core.user.db.permCook;
};




/**
 * Execute when we have an authentication event
 * from an external source.
 *
 * If we are not authed, we will perform auth procedures
 *
 * @param {core.STATIC.SOURCES} sourceId
 * @param {object} user core user data object verified
 * @return {void}
 */
core.user.auth.extAuth = function(sourceId, user)
 {
    try {

        var c = core;
        var log = c.log('core.user.auth.extAuth');

        log.info('sourceId:' + sourceId + ' authed:' + c.isAuthed());

        // if already authed exit
        if (c.isAuthed())
          return;

        // not authed, start auth
        c.user.auth.login(user, function(){}, sourceId);

    } catch(e) {
        core.error(e);
    }
};
// function core.user.auth.extAuth

/**
 * Lets us know if currently logged in user
 * has external authentication for the provided
 * source id
 *
 * @param {core.STATIC.SOURCES} sourceId
 * @return {boolean}
 */
core.user.auth.hasExtSource = function(sourceId)
 {
    //core.user.auth.hasFacebook = function ()
    try {
        var c = core;

        if (!c.isAuthed())
        return false;

        // get user object
        var user = c.user.getUserDataObject();

        if (!user['hasExtSource'])
        return false;

        // check for the source defined noc...
        var ind = c.arFindIndex(user['extSource'], 'sourceId', sourceId);

        if ( - 1 == ind)
        return false;


        return true;

    } catch(e) {
        core.error(e);
    }
};
// function core.user.auth.hasFacebook


/**
 * Gets the external auth source user's name
 *
 * @param {core.STATIC.SOURCES.FB} sourceId
 * @return {string|null} null if error / not found
 */
core.user.auth.getExtName = function(sourceId)
 {

    try {
        var c = core;
        var g = goog;

        if (!c.isAuthed())
        return null;

        // get user object
        var user = c.user.getUserDataObject();

        if (!user['hasExtSource'])
        return null;

        // check for the source defined noc...
        var ind = c.arFindIndex(user['extSource'], 'sourceId', sourceId);

        if ( - 1 == ind)
        return null;

        // check if name value is there...
        if (g.isString(user['extSource'][ind]['extUsername']))
        // got it
        return user['extSource'][ind]['extUsername'];

        return null;

    } catch(e) {
        core.error(e);
    }
};
// function core.user.auth.hasFacebook
