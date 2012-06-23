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
    var logger = goog.debug.Logger.getLogger('ss.user.login.submitCallback');
    logger.info('Init');

    try {
        // assign the recieved user data object to local db
        var user = res['user'];
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
    var logger = goog.debug.Logger.getLogger('ss.user.login.logout');

    var callback = opt_callback || function() {};

    logger.info('Init');

    // clear user db
    ss.user.db.clear();
    // clear web2.0 data objects
    ss.fb.db.clear();
    ss.web2.db.clear();

    //Parameters for AJAX
    var url = '/users/logout';
    var params = {
        typeGet: 'json',
        postMethod: 'POST'
    };

    // Initialise the object
    var a = new ss.ajax(url, params);

    //callback function
    a.callback = function(result)
    {
        var res = result['status'];
        logger.info('logout server result:' + res);
        // trigger global auth state event
        ss.user.auth.events.runEvent('authState', false);
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


