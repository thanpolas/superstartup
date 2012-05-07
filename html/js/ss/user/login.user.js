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
 *********
 *  File:: user/login.user.js
 *  Core Login User file
 *********
 */

goog.provide('ss.user.login');


/**
 * Will attempt to login user
 *
 * We will fire a callback as
 * callback(status, opt_error_msg)
 * status is boolean
 * if false, we get error msg as well for user
 *
 *
 * @param {string} user nickname or e-mail
 * @param {string} pass password
 * @param {boolean} perm Login permanently
 * @param {Function({boolean}, {string=})} callback Callback function
 * @return {boolean} - use callback func for handling
 */
ss.user.login.submit = function(user, pass, perm, callback)
 {
    //shortcut assign
    var c = core;
    var valid = c.valid;
    var err = c.err;
    var u = c.user;
    var db = u.db;
    var g = goog;
    //var lang = c.lang.user;
    var log = c.log('ss.user.login.submit');
    var genError = 'Ooops an error occured, please retry';


    log.info('Init');

    /**
     * Start Validations
     * NICKNAME / EMAIL validation
     *
     * Error reporting for user is in place in valid class method's
     */
    //validate input, check if e-mail and validate
    if ( - 1 < user.search(/\@/gi)) {
        //it's an email, check validity
        if (!valid.checkEmail(user)) {
            //not a valid e-mail
        	callback(false, err.get());
            return false;
        }
    } else {
        //it's a nickname, check validity
        if (!valid.checkNick(user)) {
            //not a valid nickname
        	callback(false, err.get());
            return false;
        }

    }
    // else not email => is nick
    /**
     * Password Validation
     * [nothing todo at the moment]
     */


    /**
     * SEND REQUEST
     *
     */
    //Parameters for AJAX
    var url = '/php/ajax/';
    var params = {
        postMethod: 'POST',
        action: 'login'


    };



    // Initialise the object
    var a = new c.ajax(url, params);

    // add needed data
    a.addData('nickname', user);
    //a.addData('password', pass);
    //if (perm)
    	//a.addData('perm_login', 1);

    //callback function
    a.callback = function(result)
    {

        // init auth...
        u.login.submitCallback(result, callback);


        return true;
    };
    //callback
    a.errorCallback = function() {

        var ajerr = a.getError();
        log.severe('Error Callback');
        err(ajerr.message);
        callback(false, ajerr.message);
    };
    //perform the execution
    if (!a.send()) {
        log.severe('Ajax Error sending');
        err(genError);
        callback(false, err.get());
        return false;
    }


    return true;
};
// method ss.user.login.submit



/**
 * Initialises user authentication
 *
 * We process the data object as passed by the server
 * after a login or register operation
 *
 * If user's credentials check ok, we auth the user and start
 * loading the user's DB
 *
 *
 * Check for permanent login using:
 * ss.user.auth.isPerm();
 * And get the server token using:
 * ss.user.auth.getPerm();
 *
 * Your callback fn will be executed as:
 * callback(status, opt_error_msg)
 * status is boolean
 * if false, we get error msg as well for user
 *
 * @param {object} res Server result object
 * @param {Function({boolean}, {string=})} callback callback function when auth finishes
 * @return {void}
 */
ss.user.login.submitCallback = function(res, callback)
 {
    //shortcut assign
    var c = core;
    var err = c.err;
    var u = c.user;
    var db = u.db;
    var g = goog;
    //var lang = c.lang.user;
    var log = c.log('ss.user.login.submitCallback');
    var genError = 'An error has occured. Please retry';
    log.info('Init');

    try {



        //log.shout('res:' + g.debug.expose(res));
        // assign the recieved user data object to local db
        var user = res['user'];

        // initialise our auth
        c.user.auth.Init(user, callback);

        return;



    } catch(e) {
        ss.error(e);
    }
};
// method ss.user.login.submitCallback



/**
 * Logout request
 *
 * We will fire a callback as
 * callback(status, opt_error_msg)
 * status is boolean
 * if false, we get error msg as well for user
 *
 *
 * @param {Function=} callback Callback function
 * @return {boolean}
 */
ss.user.login.logout = function(opt_callback)
 {
   try {
    var c = core;

    var log = goog.debug.Logger.getLogger('ss.user.login.logout');

    var callback = opt_callback || function() {};

    log.info('Init');

    // clear user db
    c.user.db.clear();
    // clear web2.0 data objects
    c.fb.db.clear();
    c.web2.db.clear();

    //Parameters for AJAX
    var url = '/users/logout';
    var params = {
        typeGet: 'json',
        typeSend: 'html',
        postMethod: 'POST',
        showMsg: false // don't show default success message
     , showErrorMsg: false // don't show error message if it happens

    };

    // Initialise the object
    var a = new c.ajax(url, params);

    //callback function
    a.callback = function(result)
    {
        var res = a.getTag('status');
        log.info('logout server result:' + res);
        // trigger global auth state event
        c.user.auth.events.runEvent('authState', false);
        callback(true);
    };
    //callback
    a.errorCallback = function(err)
    {
        callback(false);
    };

    //perform the execution
    if (!a.send()) {
      callback(false);
      return false;
    };

    return true;
   } catch(e) {
     ss.error(e);
     callback(false);
    }
};
// method ss.user.login.logout


