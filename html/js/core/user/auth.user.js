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
 * @copyright  (C) 2000-2010 Athanasios Polychronakis - All Rights Reserved
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * @createdate 25/May/2011
 *
 *********
 *  File:: user/auth.user.js
 *  Core Auth User file
 *********
 */

goog.provide('core.user.auth');

goog.require('core.user.notify');

/**
 * Perform a user authentication
 *
 * Will authenticate the user
 * We need a user data object to be provided
 *
 * Your callback fn will be executed as:
 * callback(status, opt_error_msg)
 * status is boolean
 * if false, we get error msg as well for user
 *
 * We create a ready watch called 'initLogin'
 * If you want to attach to this watch you have
 * to trigger the dummy check we set here, 'alldone':
 * c.ready.check('initLogin', 'alldone');
 *
 *
 * @param {object} user
 * @param {Function} cb callback function when auth finishes
 * @param {core.STATIC.SOURCES} sourceId the source of authentication
 * @return {void}
 */
core.user.auth.Init = function(user, cb, sourceId)
 {
    //shortcut assign
    var c = core;
    var u = c.user;
    var db = u.db;
    var g = goog;
    var log = c.log('core.user.auth.Init');
    var genError = 'An error has occured. Please retry';

    log.info('Init. authed:' + db.isAuthed);

    if (db.isAuthed) {
      cb(true);
      return;
    }

    // init the ready watch
    var ready = c.ready;
    ready('initLogin');
    ready.addCheck('initLogin', 'alldone');

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

    // notify out analytics
    c.analytics.userAuth(user);

    ready.check('initLogin', 'alldone');
    cb(true);

    log.info('Finished');

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
 * Triggers whenever we have an authentication event
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
        c.user.auth.Init(user,
        function() {},
        sourceId);

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
