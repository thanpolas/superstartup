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
 * @createdate 03/Oct/2010
 *
 *********
 *  File:: utilities/throttle.js
 *  Throttler for avoiding double clicks / actions
 *********
 */



goog.provide('core.throttle');

/**
 * Will check and open a new action throttle
 * or return false if throttle is open
 * Any throttle, not just the specific action
 *
 * @param {string} actionId unique action ID
 * @param {Number=} opt_duration Duration of block in ms
 * @param {boolean=} opt_single If set to true we only throttle specific actionId
 * @return {boolean} false if throttle is on
 */
core.throttle = function (actionId, opt_duration, opt_single)
{
    try {
    var w = core;
    var t = w.throttle;
    var db = t.db;
    var g = goog;

    var timeoutTime = opt_duration || 10000;

    // check if throttle is for single action
    if (opt_single) {
      if (g.isBoolean(db.singleThrottles[actionId])) {
        if (db.singleThrottles[actionId]) {
          return false;
        }
      }

      db.singleThrottles[actionId] = true;
      db.singleThrottlesTimeout[actionId] = setTimeout(function(){
        t.close(actionId);
      }, timeoutTime);
      return true;

    }

    // check if a throttle is open
    if (db.open) return false;

    db.open = true;



    // set safety belt in case the close won't fire... ever
    db.timeoutIndex = setTimeout(t.close, timeoutTime);

    return true;

    } catch(e) {core.error(e);}
}; // function core.staticThrottle

/**
 * Our static db
 *
 * @enum {mixed}
 */
core.throttle.db = {
    throttles: new Array(),
    open: false,
    timeout: 10000, // ultimately we close the throttle after these ms
    timeoutIndex: null,
    singleThrottles: {},
    singleThrottlesTimeout: {}

}; // dictionary core.staticThrottle.db

/**
 * Closes an open throttle
 *
 * @param {string=} actionId unique action ID. If set we are on single mode
 * @return {void}
 */
core.throttle.close = function(opt_actionId)
{
    try {
    var w = core;
    var t = w.throttle;
    var db = t.db;
    var g = goog;

    if (g.isString(opt_actionId)) {
      var actionId = opt_actionId;
      // we have a single throttle event
      db.singleThrottles[actionId] = false;
      if (g.isNull(db.singleThrottlesTimeout[actionId])) {
        clearTimeout(db.singleThrottlesTimeout[actionId]);
        db.singleThrottlesTimeout[actionId] = null;
      }

      return;

    }


    // check if a throttle is closed
    if (!db.open) return;

    db.open = false;

    // clear timeout if set
    if (!g.isNull(db.timeoutIndex)) {
        clearTimeout(db.timeoutIndex);
        db.timeoutIndex = null;
    }

    return;

    } catch(e) {core.error(e);}}; // function core.staticThrottle.close

