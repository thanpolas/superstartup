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
goog.require('ss.user.types');
goog.require('ss.user.Auth');
goog.require('ss.user.login');
goog.require('ss.user.pub');
goog.require('ss.user.Item');


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
    if (!ss.isAuthed())
        return null;

    return ss.user.db.user['userId'];
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
  if (!ss.isAuthed())
    return null;

  return ss.user.db.user['nickname'];
};

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
    if (!ss.isAuthed())
        return {};

    return ss.user.db.user['userData'];
}; // function ss.user.getUserData

/**
 * Checks if the given object is a valid
 * ss user object
 *
 * @param {object} user
 * @return {boolean}
 */
ss.user.isUserObject = function (user)
{
    try {
    var logger = goog.debug.Logger.getLogger('ss.user.isUserObject');

    if (!goog.isObject(user)) {
      logger.warning('user object passed is not an object');
      return false;
    }

    if (!goog.isString(user['nickname'])) {
      logger.warning('user object checked: Has no nickname');
      return false;
    }

    if (!goog.isBoolean(user['hasExtSource'])) {
      logger.warning('user object checked: Has no hasExtSource');
      return false;
    }

    if (user['hasExtSource']) {
      if (!goog.isArray(user['extSource'])) {
        logger.warning('user object checked: Has no extSource data');
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
 * @deprecated use user.Item class
 */
ss.user.getDummyObject = function ()
{
    return ss.user.types.user;
};









/**
 * Lets us know if this user has the specified auth source
 *
 * @param {ss.user.types.extSourceId} sourceId
 * @return {boolean}
 */
ss.user.Item.prototype.hasExtSource = function(sourceId)
 {
    if (!this.get(ss.conf.user.typeMappings.user.hasExtSource))
      return false;

    // check for the source defined noc...
    var ind = ss.arFindIndex(ss.conf.user.typeMappings.user.extSource, 
        ss.conf.user.typeMappings.extSource.sourceId, sourceId);

    if ( -1 == ind)
      return false;


    return true;

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

