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
 * createdate 28/Oct/2010
 *
 *********
 *  File:: web2.0/facebook/facebook.local.js
 *  Facebook interaction from out JS Client to our local server
 *********
 */



goog.provide('ss.fb.local');
goog.require('ss.CONSTS');

/**
 * Triggers when we have a facebook auth event
 *
 * If we are not authed we will request the server
 * to authenticate us with these credentials
 *
 * @param {Function(boolean)} listener callback function
 * @return {void}
 */
ss.fb.local.checkFacebookAuth = function (listener)
{
    try {
    var log = goog.debug.Logger.getLogger('ss.fb.local.checkFacebookAuth');

    log.info('Init. Authed:' + ss.isAuthed());

    // if authed exit
    if (ss.isAuthed()) {
        listener(true);
        return;
    }


    // create request
    var url = "/users/facebook";
    var a = new ss.ajax(url, {
        typeGet: 'json',
        postMethod: 'POST'
    });


    // responce from server
    a.callback = function(result) {

        var user = result['user'];
        var newuser = resylt['newuser'];

        // check if user is valid user object
        if (!ss.user.isUserObject(user)) {
            listener(false);
            return; // no need to continue further
        }

        // user logged in
        ss.web2.extLogin(ss.CONSTS.SOURCES.FB, user);

        // check if newuser
        if (newuser) {
            // open welcome window
            ss.user.auth.events.runEvent('newUser');
        }

        listener(true);
    }; //callback of AJAX

    a.errorCallback = function(errorobj) {
        log.warning('Server did not authorize us! msg:' + errorobj.message + ' ::debug::' + errorobj.debugmessage);
        listener(false);
    }; // errorCallback of spot request

    //send the query
    if (!a.send()) {
        listener(false);
        return;
    }

    } catch(e) {ss.error(e);}

}; // function ss.fb.local.checkFacebookAuth


/**
 * Triggers when we have a facebook auth event
 *
 * If we are not authed we will request the server
 * to authenticate us with these credentials
 *
 * @param {Function(boolean)=} opt_listener callback function
 * @return {void}
 */
ss.fb.local.loginSubmit = function (opt_listener)
{
    try {

    var log = goog.debug.Logger.getLogger('ss.fb.local.loginSubmit');

    log.info('Init. Authed:' + ss.isAuthed());

    var listener = opt_listener || function (){};

    // if authed exit
    if (ss.isAuthed()) {
        ss.web2.extLogin(ss.CONSTS.SOURCES.FB, ss.user.getUserDataObject());
        listener(true);
        return;
    }


    // create request
    var url = "/users/facebook";
    var a = new ss.ajax(url, {
        typeGet: 'json',
        postMethod: 'POST'
    });


    // responce from server
    a.callback = function(result) {
      try {

        var user = result['user'];
        var newuser = result['newuser'];

        log.info('Got callback. newuser:' + newuser);

        // check if user is valid user object
        if (!ss.user.isUserObject(user)) {
            listener(false);
            return; // no need to continue further
        }


        // user logged in
        ss.web2.extLogin(ss.CONSTS.SOURCES.FB, user, newuser);

        listener(true);

        if (newuser) {
            ss.user.auth.events.runEvent('newUser');
        }

      } catch(e) {
        ss.error(e);
        listener(false);
      }

    }; //callback of AJAX

    a.errorCallback = function(errorobj) {
        log.warning('Server did not authorize us! msg:' + errorobj.message + ' ::debug::' + errorobj.debugmessage);
        listener(false);
    }; // errorCallback of spot request

    //send the query
    if (!a.send()) {
        listener(false);
        return;
    }

    } catch(e) {
      listener(false);
      ss.error(e);
    }

}; // function ss.fb.local.loginSubmit



/**
 * Inform server that we have a new comment
 *
 * @param {object} data Data object as passed from FB
 * @param {boolean=} opt_rem Set to true if action is REMOVE
 * @param {Function=} opt_cb Callback function (status, opt_errmsg)
 * @return {void}
 */
ss.fb.local.commentCreate = function (data, opt_rem, opt_cb)
{
  try {
    var cb = opt_cb || function(){};

    // set REMOVE switch
    var rem = opt_rem || false;

    var aj = new ss.ajax((rem ? '/cmnts/fbremove' : '/cmnts/fbcreate'), {
      postMethod: 'POST'
    });
    /**
     * Our passed variables are:
     * commentID :: string (id number)
     * href :: Url of object that was commented
     * parentCommentId :: undefined|string (id number)
     *
     */
    aj.addData('commentID', data['commentID']);
    aj.addData('href', data['href']);
    if (!rem)
      aj.addData('parentCommentId', data['parentCommentId']);

    // ajax callback listener
    aj.callback = function (result)
    {
      try {
        cb(true);
      } catch(e) {
        ss.error(e);
        cb(true);
      }
    };

    // ajax error listener
    aj.errorCallback = function (errorobj)
    {
      try {
      // errorobj.message
      // errorobj.debugmessage
      cb(false, errorobj.message);

      } catch (e) {
        ss.error(e);
      }

    };

    // send ajax request
    aj.send();



  } catch (e) {
    ss.error(e);
    cb(false, 'error');
  }

}; // ss.fb.local.commentCreate



