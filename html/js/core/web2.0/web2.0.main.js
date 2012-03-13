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
 * @createdate 29/Oct/2010
 *
 *********
 *  File:: web2.0/web2.0.main.js
 *  main file for social integration libraries (auth/share/etc)
 *********
 */


goog.provide('core.web2');

goog.require('core.events.listeners');
goog.require('core.fb');
goog.require('core.fb.API');
goog.require('core.twit');

/**
 * Local data object
 */
core.web2.db = {

    /**
     * If we have external sources authentication
     *
     * @type {boolean}
     */
    isExtAuthed: false,

    /**
     * This var contains an array of core.STATIC.SOURCES
     * values, indicates that we are authed on these
     * external sources
     *
     * @type {Array<core.STATIC.SOURCES>}
     */
    extAuthSources: [],

    /**
     * Add here the external sources we have integraded
     * for authentication on client side
     *
     * @type {Array<core.STATIC.SOURCES>}
     */
    supportedSources: [core.STATIC.SOURCES.FB],

    /**
     * Initial external auth check needed vars
     */
    initialCheck: {
        timeoutTime: 2000, // ultimate timeout for waiting external sources auth
        timeout: null, // setTimeout pointer
        finished: false, // Indicates that we fired the authState event

        /**
         * The checks array contains the external sources that
         * have checked and their status.
         *
         * Object structure:
         * {
         *      sourceId: 0,
         *      initState: false,
         *      endState: false
         * }
         */
        checks: []
    }

};

/**
 * Call this method whenever we want to clear the data objects
 *
 * because of a logout action...
 *
 * @return {void}
 */
core.web2.db.clear = function ()
{
    var c = core;
    var db = c.web2.db;

    // check if we were authed from external source
    if (db.isExtAuthed) {
        c.web2.extLogout();
    }

    db.isExtAuthed = false;
    db.extAuthSources = [];
}; // funtion core.web2.db.clear

/**
 * Add events for for web2.0
 *
 * Use this instance of core.events.listeners
 * to add events listeners
 *
 * Valid events are, along with their parameters:
 *
 * login {sourceId, user}
 *      When we have recieved login ok from facebook but
 *      not yet validated with our servers
 * loginReady (sourceId, user)
 *      When we get reply from server and has validated our auth request
 * newuser (sourceId, user)
 *      If the user logged in is a new user
 * initAuthState (state{boolean})
 *      Fired when initial probe to external auth sources
 *      has finished.
 *
 */
core.web2.events = new core.events.listeners();


/**
 * We will return one external source data object
 * from the user data obejct provided.
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
 * @param {object} userObj The user data object
 * @param {core.STATIC.SOURCES} opt_prefferedSource
 * @return {object}
 */
core.web2.getUserExt = function(userObj, opt_prefferedSource)
{
  try {
    var g = goog, c = core;

    var prefSource = opt_prefferedSource || c.STATIC.SOURCES.FB;

    var u = userObj;
    var extObj = {};
    var foundPref = false;

    if (!g.isArray(u.extSource)) {
      // got a broken object...
      var user = c.user.getDummyObject();
      return user.extSource[0];

    }

    g.array.forEach(u.extSource, function (extSource, index){
      if (foundPref) return;
      extObj =  c.copy(extSource);
      if (prefSource == extSource.sourceId)
        foundPref = true;
    });



    return extObj;
  } catch(e) {core.error(e);}
};


/**
 * This function must be called whenever we have
 * an authentication verification from the
 * server for an external source auth.
 *
 *
 * @param {number} sourceId The external source id
 * @param {object} user core user data object
 * @param {boolean=} opt_newuser If user logged in is new
 * @return {void}
 */
core.web2.extLogin = function (sourceId, user, opt_newuser)
{
    try {

    var g = goog;
    var w = core;
    var w2 = w.web2;
    var log = w.log('core.web2.extLogin');

    log.info('Init. sourceId:' + sourceId + ' opt_newuser:' + opt_newuser);

    // check if we already know that
    if (w2.isExtAuthed(sourceId)) {
        // yes we do
        log.shout('We already know that we are authed with this source');
        return;
    }


    // assign the login
    w2.db.isExtAuthed = true;
    w2.db.extAuthSources.push(sourceId);

    

    log.info('Running event. user');
    // call attached core events
    w2.events.runEvent('login', sourceId, user);

    // auth the user localy
    w.user.auth.extAuth(sourceId, user);

    // auth has happened call rest events
    w2.events.runEvent('loginReady', sourceId, user);

    // check if new user and fire said event
    if (opt_newuser)
        w2.events.runEvent('newuser', sourceId, user);

    // trigger global auth state event
    w2.events.runEvent('initAuthState', true);

    } catch(e) {core.error(e);}
}; // function core.web2.extLogin

/**
 * Checks if we are authed for the specified
 * external source.
 *
 * CAUTION
 * This function only checks if we activly know
 * we have an external authentication (for now
 * only from FB).
 *
 * We do not check if user has external linked
 * sources... use the .hasExtSource() function
 * for this...
 *
 * @param {core.STATIC.SOURCES} sourceId
 * @return {boolean}
 */
core.web2.isExtAuthed = function (sourceId)
{
    try {
    var g = goog;
    var w = core;
    var w2 = w.web2;

    // ugly patch for mobile (FB Only now)
    if (w.MOBILE) {
        return Titanium.Facebook.isLoggedIn();
    }

    if (!w2.db.isExtAuthed)
        return false;

    if (g.array.contains(w2.db.extAuthSources, sourceId))
        return true;

    return false;

    } catch(e) {core.error(e);}
}; // function core.web2.isExtAuthed

/**
 * Checks if user has linked his account with
 * an external source
 *
 * @param {core.STATIC.SOURCES} sourceId
 * @return boolean
 * @deprecated use core.user.auth.hasExtSource
 */
core.web2.hasExtSource = function (sourceId)
{
    try {
    return core.user.auth.hasExtSource(sourceId);
    } catch(e) {core.error(e);}
}; // function core.web2.hasExtSource


/**
 * Get the external sources that we
 * are currently authenticated at (only FB
 * has auth at client side)
 *
 * @return {Array<core.STATIC.SOURCES>}
 */
core.web2.getExtSources = function ()
{
    return core.web2.db.extAuthSources;

}; // func core.web2.getExtSources

/**
 * We collect initial authentication checks from
 * external sources.
 *
 * This function is aware of each external source
 * we integrade for auth. These are set at: core.web2.db.supportedSources
 * On startup we check the auth states for these sources
 *
 * As each external source responds it calls this function
 *
 * There is an initial state (initState) which is the response
 * as we get it from the external source. And if true we expect
 * another call with an endState which let's us know if
 * our server honors this authentication request
 *
 * When all external auth requests finish we fire the 'authState'
 * event from our events instance
 *
 * @param {core.STATIC.SOURCES} sourceId The source id
 * @param {boolean} initState Initial responce from ext source. If true we wait for final state
 * @param {boolean=} opt_endState If initState was true we check with our servers to validate
 *      the auth. This lets us know if server honored us
 * @return {void}
 */
core.web2.collectInitialAuthChecks = function (sourceId, initState, opt_endState)
{
    try {
    var g = goog;
    var w = core;
    var w2 = w.web2;
    var db = w2.db;

    var log = w.log('core.web2.collectInitialAuthChecks');

    log.fine('Init. sourceId:' + sourceId + ' initState:' + initState + ' endState:' + opt_endState
        + ' finished:' + db.initialCheck.finished);



    // decide on endState
    if (g.isBoolean(opt_endState))
        var endState = opt_endState;
    else
        var endState = null;

    log.fine('endState type:' + g.typeOf(endState) + ' typeOf opt_endState:' + g.typeOf(opt_endState));

    // check if we have checked this sourceId before
    var ind = w.arFindIndex(db.initialCheck.checks, 'sourceId', sourceId);
    if (-1 == ind) {
        // not found, create it
        var checkObj = {
            sourceId: sourceId,
            initState: initState,
            endState:  endState
        };
        db.initialCheck.checks.push(checkObj);

        // decide on our fate now
        _checkState(checkObj);
    } else {
        //get the check
        var checkObj = db.initialCheck.checks[ind];
        // update the end state
        checkObj['endState'] = endState;
        // decide on our fate
        _checkState(checkObj);

    }

    } catch(e) {core.error(e);}

    /**
     * Perform auth checks, if we need to trigger the event and on...
     *
     * @param {object} checkObj
     * @return {void}
     * @private
     */
    function _checkState (checkObj)
    {
        try {

        if (db.initialCheck.finished) {
          log.info('_checkState we were already finished, exiting');
          return;
        }
        // open this switch if check object needs closing
        var checkClosed = false;

        //log.info('_checkState called. checkObj:' + g.debug.expose(checkObj));

        if (checkObj.initState) {
            if (checkObj.endState) {
                // user authed fire event and exit, we are done
                db.initialCheck.finished = true;
                // remove timeout
                clearTimeout(db.initialCheck.timeout);
                db.initialCheck.timeout = null;
                // notify local data object
                log.info('Notifying local data object for sourceId:' + checkObj.sourceId);
                db.isExtAuthed = true;
                if (!w2.isExtAuthed(checkObj.sourceId))
                    db.extAuthSources.push(checkObj.sourceId);

                // check if already finished or is already authed... (sour grapes)
                if (db.initialCheck.finished || w.isAuthed()) {
                    //return;
                }

                // trigger the event
                w2.events.runEvent('initAuthState', true);
                // exit
                return;
            }

            if (g.isNull(checkObj.endState)) {
                // core server auth validation pending...
                log.fine('endState is null exiting');
                return;
            }

            // this is a false state of endState for our
            // server validation, close this object
            checkClosed = true;
        } else {
            // initial state is false
            checkClosed = true;

        }

        //log.info('here:' + checkClosed);

        // if the object closed
        if (checkClosed) {
            // object closed (with a false outcome)
            // check if we have more ext sources pending
            // for auth

            // TODO it...
            // now exec event
                // user authed fire event and exit, we are done
                db.initialCheck.finished = true;
                // remove timeout
                clearTimeout(db.initialCheck.timeout);
                db.initialCheck.timeout = null;

                // trigger the event
                w2.events.runEvent('initAuthState', false);
                // exit
                return;

        }


        } catch(e) {core.error(e);}
    } // function _checkState



}; // function core.web2.collectInitialAuthChecks

/**
 * Fires when ultimate auth state timeout fires
 *
 * ext auth sources have timed out... we fire
 * the event ...
 *
 * @return {void}
 */
core.web2.authStateTimeout = function ()
{
    try {

    var g = goog;
    var w = core;
    var w2 = w.web2;
    var db = w2.db;

    var log = w.log('core.web2.authStateTimeout');

    log.shout('web2.0 Ultimate timeout fired. db.finished:' + db.initialCheck.finished + ' Authed:' + w.isAuthed());



    // check if already finished or is already authed... (sour grapes)
    //if (db.initialCheck.finished || w.isAuthed())
      //  return;

    // user authed fire event and exit, we are done
    // db.initialCheck.finished = true;
    // remove timeout

    db.initialCheck.timeout = null;

    // trigger the event
    w2.events.runEvent('initAuthState', false);

    } catch(e) {core.error(e);}
}; // function core.web2.authStateTimeout


/**
 * Log out the user from external source as well
 *
 * @return {void}
 */
core.web2.extLogout = function ()
{
    // if on mobile, exit... (no solution yet)
    if (core.MOBILE)
        return;

    FB.logout(function(response) {
      // user is now logged out
    });
}; // function core.web2.extLogout
