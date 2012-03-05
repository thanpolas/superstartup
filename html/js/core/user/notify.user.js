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
 * @createdate 02/Jul/2011
 *
 *********
 *  File:: user/notify.user.js
 *  Handler for user notifications
 *********
 */



goog.provide('core.user.notify');
goog.require('core.events.listeners');


/**
 * Our static DB
 *
 */
core.user.notify.db = {
  staticNotify: [],
  notify: {
    newMessage: 0,
    newNotifications: 0,
    totalNotifications: 0
  },
  newListeners: new Array()
};

/**
 * A new notification is received from the server
 *
 * Update our counters and trigger proper events
 *
 * @param {object} notifyObject Notification object as passed from the server
 * @return {void}
 */
core.user.notify.newNotification = function (notifyObject)
{
  try {
    var c = core, g = goog;
    var log = c.log('core.user.notify.newNotification');

    log.info('Init');

    // check for new messages
    if (g.isObject(notifyObject['message'])) {
      // we have new messages, substract current message count from total
      c.user.notify.db.notify.totalNotifications -= c.user.notify.db.notify.newMessage;
      // now work from here up...
      c.user.notify.db.notify.newMessage = notifyObject['message']['total'];
      c.user.notify.db.notify.totalNotifications += notifyObject['message']['total'];
      log.info('Found new messages:' + c.user.notify.db.notify.newMessage);
    }

    if (g.isObject(notifyObject['frameComment'])) {
      // we have new frame comments
      c.user.notify.db.notify.newNotifications += notifyObject['frameComment']['total'];
      c.user.notify.db.notify.totalNotifications += notifyObject['frameComment']['total'];
      log.info('Found new frame Comments. newNotifications:' + c.user.notify.db.notify.newNotifications);
    }

    if (g.isObject(notifyObject['mention'])) {
      // we have a new mention
      c.user.notify.db.notify.newNotifications += notifyObject['mention']['total'];
      c.user.notify.db.notify.totalNotifications += notifyObject['mention']['total'];
      log.info('Found new user mention. newNotifications:' + c.user.notify.db.notify.newNotifications);
    }

    // call all listeners
    c.user.notify._callNewListeners();


  } catch (e) {
    core.error(e);
  }

};

/**
 * Initialize notifications when user has logged in
 * and we have the user data object
 *
 * @return {void}
 */
core.user.notify.Init = function ()
{
  try {
    var c = core;
    var log = c.log('core.user.notify.Init');

    log.info('Init');

    // get the user's data object
    var u = c.user.getUserDataObject();

    // get unread messages count
    var newMessage = Number(u['newMessage']);
    // get rest of notifications count
    var newNots = Number(u['newNotifications']);

    if (0 < newMessage) {
      // we have new messages
      log.info('New messages found:' + newMessage);
      c.user.notify.db.notify.newMessage = newMessage;
    }

    if (0 < newNots) {
      log.info('New Notifications found:' + newNots);
      c.user.notify.db.notify.newNotifications = newNots;
    }

    c.user.notify.db.notify.totalNotifications = newMessage + newNots;
  } catch (e) {
    core.error(e);
  }

};

/**
 * Simple getter for the notify object
 *
 * @return {object}
 */
core.user.notify.get = function()
{
  return core.user.notify.db.notify;
};


/**
 * Let's us know if we have any new notifications
 *
 * @return {boolean}
 */
core.user.notify.has = function()
{
  if (0 < core.user.notify.db.notify.totalNotifications)
    return true;
  return false;
};

/**
 * Add listeners to new notifications event
 *
 * @param {Function(object)} fn listener function
 * @param {string=} Optionaly define which type of new notification
 *    we want to listen to. Options: message
 * @return {void}
 */
core.user.notify.hookNew = function (fn, opt_type)
{
  opt_type = opt_type || 'all';
  core.user.notify.db.newListeners.push({fn: fn, type: opt_type});
};


/**
 * Set a value to any of the notification objects
 * we watch (for now only messages)
 *
 * @param {string} what one of: message
 * @param {Number} value The new value
 * @return {void}
 */
core.user.notify.set = function(what, value)
{
  try {
    var c = core;
    var n = c.user.notify.db.notify;
    switch(what) {
      case 'message':
        n.newMessage = value;
        n.totalNotifications = n.newMessage + n.newNotifications;
        // call listeners for new notifications...
        c.user.notify._callNewListeners();
      break;
      case 'notifications':
        n.newNotifications = value;
        n.totalNotifications = n.newMessage + n.newNotifications;
        c.user.notify._callNewListeners();
      break;
    }
  } catch (e) {
    core.error(e);
  }

};


/**
 * Calls any (if any) listeners for the new notifications
 * events
 *
 * @private
 * @return {void}
 */
core.user.notify._callNewListeners = function()
{
  try {
    var g = goog, c = core;
    g.array.forEach(c.user.notify.db.newListeners, function(fnObj){
      switch(fnObj.type) {
        case 'all':
          fnObj.fn(c.user.notify.db.notify);
        break;
        case 'message':
          // TODO check if we have new message here, when more event types are added
          if (0 < c.user.notify.db.notify.newMessage)
            fnObj.fn(c.user.notify.db.notify.newMessage);
        break;
        case 'notifications':
          //if (0 < c.user.notify.db.notify.newNotifications)

          // for now we will call even with zero notifications
          // to properly reset the notifications panel badge
          fnObj.fn(c.user.notify.db.notify.newNotifications);
        break;
      }

    });

  } catch (e) {
    core.error(e);
  }

};

/**
 * Request the latest static notifications from
 * server
 *
 * @param {Function(boolean, string)} cb
 * @return {void}
 */
core.user.notify.getStaticFromServer = function(cb)
{
  try {

  var c = core, g = goog;

  var log = c.log('core.user.notify.getStaticFromServer');

  var aj = new c.ajax('/users/notify', {
      postMethod: 'POST'
     , showMsg: false // don't show default success message
     , showErrorMsg: false // don't show error message if it happens
    });

    // ajax callback listener
    aj.callback = function (result)
    {
      try {

        if (10 == result['status']) {
          // we have a data object
          c.user.notify.db.staticNotify = result['notifications'];
          // parse it and make data field proper
          var json = JSON;
          g.array.forEach(c.user.notify.db.staticNotify, function(item, index){
            try{
              item['data'] = json.parse(item['data']);
            } catch(e) {
              log.warning('Item data on index:' + index + ' did not parse for JSON:' + item['data']);
              core.error(e);
            }
          });

          cb(true);
          return;
        }

        cb(false);

      } catch(e) {
        core.error(e);
      }
    };

    // ajax error listener
    aj.errorCallback = function (errorobj)
    {
      try {
      // errorobj.message
      // errorobj.debugmessage
      cb(false);

      } catch (e) {
        core.error(e);
      }

    };

    // send ajax request
    aj.send();


  } catch (e) {
    core.error(e);
  }

};


/**
 * Simple getter for notify static data object
 *
 * @return {array}
 */
core.user.notify.getStatic = function()
{
  return core.user.notify.db.staticNotify;
};
