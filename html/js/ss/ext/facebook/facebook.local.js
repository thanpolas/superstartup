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
goog.require('ss.STATIC');

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

    var w = ss;
    var log = w.log('ss.fb.local.checkFacebookAuth');

    log.info('Init. Authed:' + w.isAuthed());

    // if authed exit
    if (w.isAuthed()) {
        listener(true);
        return;
    }


    // create request
    var url = "/users/facebook";
    var a = new w.ajax(url, {
        typeGet: 'json',
        typeSend: 'json',
        postMethod: 'POST',
        showMsg: false,
        showErrorMsg: false

    });


    // responce from server
    a.callback = function(result) {



        var user = a.getTag('user');
        var newuser = a.getTag('newuser');



        // check if user is valid user object
        if (!w.user.isUserObject(user)) {
            listener(false);
            return; // no need to continue further
        }

        // user logged in
        w.web2.extLogin(w.STATIC.SOURCES.FB, user);

        // check if newuser
        if (newuser) {
            // open welcome window
            w.user.auth.events.runEvent('newUser');
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

    var fb = FB;
    var w = ss;
    var g = goog;
    var log = w.log('ss.fb.local.loginSubmit');

    log.info('Init. Authed:' + w.isAuthed());

    var listener = opt_listener || function (){};

    // if authed exit
    if (w.isAuthed()) {
        w.web2.extLogin(w.STATIC.SOURCES.FB, w.user.getUserDataObject());
        listener(true);
        return;
    }


    // create request
    var url = "/users/facebook";
    var a = new w.ajax(url, {
        typeGet: 'json',
        typeSend: 'json',
        postMethod: 'POST',
        showMsg: false


    });


    // responce from server
    a.callback = function(result) {
      try {

        var user = a.getTag('user');
        var newuser = a.getTag('newuser');

        log.info('Got callback. newuser:' + newuser);

        //log.info('user:' + g.debug.expose(user));

        // check if user is valid user object
        if (!w.user.isUserObject(user)) {
            listener(false);
            return; // no need to continue further
        }


        // user logged in
        w.web2.extLogin(w.STATIC.SOURCES.FB, user, newuser);

        listener(true);

        if (newuser) {
            w.user.auth.events.runEvent('newUser');
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
 * Triggers when we have a facebook auth event
 * for the currently logged in user. This means
 * we have to link the user with the now authorized
 * facebook account...
 *
 * Do that
 *
 * @param {Function({boolean})=} opt_listener callback function
 * @param {object=} opt_fbuser if on mobile mode we need the fb user data object
 * @return {void}
 */
ss.fb.local.linkUser = function (opt_listener, opt_fbuser)
{
    try {


    var w = ss;
    var log = w.log('ss.fb.local.linkUser');

    log.info('Init. Authed:' + w.isAuthed());

    var listener = opt_listener || function (){};

    // create request
    var url = "/";
    var a = new w.ajax(url, {
        typeGet: 'json',
        typeSend: 'json',
        postMethod: 'POST',
        origin: 400


    });

    // if on mobile add the user data object
    if (w.MOBILE) {
        a.addData('fbuser', opt_fbuser);
    }


    // responce from server
    a.callback = function(result) {


        var user = a.getTag('user');


        //log.info('user:' + g.debug.expose(user));

        // check if user is valid user object
        if (!w.user.isUserObject(user))
            return; // no need to continue further

        // user has linked successfully his account
        // we will force the new object recieved in our
        // localy stored data object
        w.user.db.user = user;
        w.web2.extLogin(w.STATIC.SOURCES.FB, user);

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

}; // function ss.fb.local.linkUser


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
    var c = ss;

    var cb = opt_cb || function(){};

    // set REMOVE switch
    var rem = opt_rem || false;

    var aj = new c.ajax((rem ? '/cmnts/fbremove' : '/cmnts/fbcreate'), {
      postMethod: 'POST'
      , showMsg: false // don't show default success message
      , showErrorMsg: false // don't show error message if it happens
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


