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
 *  File:: user/main.user.js
 *  Core main User file
 *********
 */


goog.provide('ss.user');
goog.require('ss.user.auth');
goog.require('ss.user.login');
goog.require('ss.user.profile');
goog.require('ss.user.pub');
goog.require('ss.user.metadata');


/**
 * static Data storage
 *
 */
ss.user.db = {
	    /**
	     * The user data object, provided from the server
	     */
	    user: {},
	    /**
	     * The cookies we have stored. This is an array
	     */
	    cookie: [],
	    isAuthed: false, //self explanotary
	    isVerified: false, //same...
	    // cookie object as passed from the server
	    serverCook: {},
	    permLogin: false,
	    permCook: {}

};

/**
 * Resets the user db to original not logged in
 * values
 *
 * @return void
 */
ss.user.db.clear = function()
{
    var db = ss.user.db;
    db.user = {};
    db.cookie = [];
    db.isAuthed = false;
    db.isVerified = false;
    db.serverCook = {};
    db.permLogin = false;
    db.permCook = {};
}; // method ss.user.db.clear



/**
 * Get the user id number of the currently
 * logged in user
 *
 * @return {Number|null} null if not logged in or error
 */
ss.user.getUserId = function ()
{
    var w = core;
    if (!w.isAuthed())
        return null;

    return w.user.db.user['userId'];
}; // method ss.user.getUserId

/**
 * Get current user's nickname
 *
 * If no user is logged in we return null
 *
 * @return {string|null}
 */
ss.user.getNickname = function ()
{
  var c = core;
  if (!c.isAuthed())
    return null;

  return c.user.db.user['nickname'];
}

/**
 * return the user data object
 *
 * @return {object}
 */
ss.user.getUserDataObject = function ()
{
    return ss.user.db.user;
}; // function ss.user.getUserDataObject

/**
 * Return the logged in user's data object
 *
 * @return {object}
 */
ss.user.getUserData = function ()
{
    var c = core;
    if (!c.isAuthed())
        return {};

    return c.user.db.user['userData'];
}; // function ss.user.getUserData

/**
 * Perform follow user
 *
 * @param {string} uid url unique user id
 * @param {Function({boolean}, {opt_error_message})} listener callback function with state for execution
 * @return {void}
 */
ss.user.follow = function (uid, listener)
{
    try {

    var w = core;
    var g = goog;

    if (!w.isAuthed()) {
        listener(false, 'Not logged in');
        return;
    }

    // create request
    var url = "/";
    var a = new w.ajax(url, {
        typeGet: 'json',
        typeSend: 'html',
        postMethod: 'POST',
        oper: w.update.oper.user.follow,
        origin: 131
    });
    a.addData("uid", uid);

    // default error message
    var errmsg = 'There was a problem, please retry';

    a.callback = function(result) {
        // inform pup that we have a follow
        w.user.pup.userFollow(uid);
        // update the user data object
        w.user.db.user['userData']['stats']['following']++;
        // check if less than 5 folloing
        if (5 > w.user.db.user['userData']['stats']['following']) {
            w.user.db.user['userData']['following'].push(uid);
        }
        // call listener
        listener(true);
    };
    a.errorCallback = function (errObj)
    {
        listener(false, errObj.message);
        return;
    };

    if (!a.send()) {
        listener(false, errmsg);
        return;
    }

    } catch(e) {ss.error(e);}
}; // function ss.user.follow




/**
 * Perform unfollow user
 *
 * @param {string} uid url unique user id
 * @param {Function({boolean}, {opt_error_message})} listener callback function with state for execution
 * @return {void}
 */
ss.user.unfollow = function (uid, listener)
{
    try {

    var w = core;
    var g = goog;

    if (!w.isAuthed()) {
        listener(false, 'Not logged in');
        return;
    }

    // create request
    var url = "/";
    var a = new w.ajax(url, {
        typeGet: 'json',
        typeSend: 'html',
        postMethod: 'POST',
        oper: w.update.oper.user.follow,
        origin: 132
    });
    a.addData("uid", uid);

    // default error message
    var errmsg = 'There was a problem, please retry';

    a.callback = function(result) {
        // inform pup that we have an unfollow
        w.user.pup.userUnFollow(uid);
        // update the user data object
        w.user.db.user['userData']['stats']['following']--;
        // check if less than 5 following
        if (5 > w.user.db.user['userData']['stats']['following']) {
            w.user.db.user['userData']['following'].push(uid);
        }
        // call listener
        listener(true);
    };
    a.errorCallback = function (errObj)
    {
        listener(false, errObj.message);
        return;
    };

    if (!a.send()) {
        listener(false, errmsg);
        return;
    }

    } catch(e) {ss.error(e);}
}; // function ss.user.follow


/**
 * Checks if the given object is a valid
 * core user object
 *
 * @param {object} user
 * @return {boolean}
 */
ss.user.isUserObject = function (user)
{
    try {

    var g = goog;
    var log = ss.log('ss.user.isUserObject');

    if (!g.isObject(user)) {
      log.warning('user object passed not an object');
      return false;
    }



    // check for vital keys
    //if (!g.isString(user['uid']))
    //    return false;


    if (!g.isString(user['nickname'])) {
      log.warning('user object checked: Has no nickname');
      return false;
    }

    if (!g.isBoolean(user['hasExtSource'])) {
      log.warning('user object checked: Has no hasExtSource');
      return false;
    }

    if (user['hasExtSource']) {
      if (!g.isArray(user['extSource'])) {
        log.warning('user object checked: Has no extSource data');
        return false;
      }

    }


    return true;
    } catch(e) {ss.error(e);}
}; // function ss.user.isUserObject

/**
 * Return an empty dummy user data object
 *
 * @return {object}
 */
ss.user.getDummyObject = function ()
{
  try {
    return {
    'userId' : 0,
    'nickname' : '',
    'fullname' : '',
    'createDate' : '2011-06-11 13:00:23',
    'hasExtSource' : 1,
    'extSource' : [
      {
        'sourceId' : 0,
        'extUserId' : 0,
        'extUrl' : '',
        'extUsername' : '',
        'extProfileImageUrl' : ''
      }
    ]};

  } catch (e) {
    ss.error(e);
  }



};