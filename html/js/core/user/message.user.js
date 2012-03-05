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
 * @createdate 28/Jun/2011
 *
 *********
 *  File:: user/message.user.js
 *  Messaging system
 *********
 */

goog.provide('core.user.message');

/**
 * The private messages class
 *
 * There can be only one instance of this class
 * per page load so use the: core.user.message.get()
 * static function to get the instance
 *
 * @constructor
 */
core.user.message = function()
{
  try {


  this.db = {
    // messages and users will contain the two
    // master data objects as returned by the server
    messages: null,
    users: null,
    // additionaly we will use these arrays
    // to separate read and unread messages
    readMsg: new Array(),
    unreadMsg: new Array()
  }

  } catch (e) {
    core.error(e);
  }

};

/**
 * Our static db
 */
core.user.message.db = {
  msgInstance: null
};

/**
 * Get the (only one) instance of message class
 *
 * @return {c.user.message}
 */
core.user.message.get = function ()
{
  try {
    var c = core, g = goog;

    if (g.isNull(c.user.message.db.msgInstance))
      c.user.message.db.msgInstance = new c.user.message();

    return c.user.message.db.msgInstance;

  } catch (e) {
    core.error(e);
  }


};


/**
 * Send a private message
 *
 * params = {
 *  to_userId: {number} receipient user Id
 *  message: {string} The private message
 * }
 *
 * @param {object} params Required parameters as described in method
 * @param {Function(boolean, string=)} listener Callback listener
 * @return {void}
 */
core.user.message.prototype.submit = function (params, listener)
{
  try {
    var c = core;

    var log = c.log('core.user.message.prototype.submit');

    log.info('Init');

    var aj = new c.ajax('/message/send', {
      postMethod: 'POST'
    , showMsg: false // don't show default success message
    , showErrorMsg: false // don't show error message if it happens
    });

    aj.addData('to_userId', params.to_userId);
    aj.addData('message', params.message);

    // ajax callback listener
    aj.callback = function (result)
    {
      try {
        // check if everything is ok
        if (10 == result['status']) {
          listener(true);
          return;
        }

        listener(false, 'Please try again.');

      } catch(e) {
        core.error(e);
        listener(false, 'Please try again.');
      }
    };

    // ajax error listener
    aj.errorCallback = function (errorobj)
    {
      try {
      // errorobj.message
      // errorobj.debugmessage
      listener(false, errorobj.message);

      } catch (e) {
        core.error(e);
      }

    };

    // send ajax request
    aj.send();



  } catch (e) {
    core.error(e);
    listener('false', 'Please try again');
  }

};


/**
 * Retrieve all messages for current user
 *
 * @param  {function(boolean, string=)} listener
 * @return {void}
 */
core.user.message.prototype.getFromServer = function (listener)
{
  try {

    var c = core, g = goog;
    var _this = this;
    var log = c.log('core.user.message.getFromServer');

    var aj = new c.ajax('/message/get', {
      postMethod: 'POST'
     , showMsg: false // don't show default success message
     , showErrorMsg: false // don't show error message if it happens
    });

    // ajax callback listener
    aj.callback = function (result)
    {
      try {

        // check if we got a valid result
        if (!g.isArray(result['message'])) {
          // no messages, but did we have an error?
          if (10 != result['status']) {
            listener(false, 'Please try again');
            return;
          }

          // retutned true but no messages for the user
          listener(true);
          return;
        }

        _this.db.messages = result['message'];
        _this.db.users = result['user'];
        // parse incoming data
        _this._parseData();
        listener(true);


      } catch(e) {
        core.error(e);
        listener(false, 'Please try again');
      }
    };

    // ajax error listener
    aj.errorCallback = function (errorobj)
    {
      try {
      // errorobj.message
      // errorobj.debugmessage
      listener(false, errorobj.message);

      } catch (e) {
        core.error(e);
        listener(false, 'Please try again');
      }

    };

    // send ajax request
    aj.send();

  } catch (e) {
    core.error(e);
    listener(false, 'Please retry');
  }

};

/**
 * After we receive our initial message data object
 * we execute this method to format the data properly
 * for use.
 *
 * We include in each message the user data object
 * and see if we have any unread messages, which are removed
 * from the this.db.message array and inserted in the .unread one
 *
 *
 * @private
 * @return {void}
 */
core.user.message.prototype._parseData = function ()
{
  try {
    var g = goog, c = core;
    var log = c.log('core.user.message._parseData');

    log.info('Init');

    // reset variables we will work on...
    var badMsgIndex = new Array();
    this.db.readMsg = new Array();
    this.db.unreadMsg = new Array();
    // itterate through all the messages
    g.array.forEach(this.db.messages, function(msg, index){
      try {
        // check if our user is sender or receiver
        if (c.user.getUserId() == msg['to_userId'])
          var userId = msg['from_userId'];
        else
          var userId = msg['to_userId'];

        // Check if the other user's data object exists
        if (!g.isObject(this.db.users[userId])) {
          // bad message, bad bad bad
          log.warning('Message could not find other user. MsgId:' + msg['msgId']);
          badMsgIndex.push(index);
          return;
        }

        // link the other user's data object with our message object
        msg.user = this.db.users[userId];


        // check if message is unread
        if (c.user.getUserId() == msg['to_userId'] && !msg['is_read']) {
          // found one, push it to out unread array and store it's msgID
          this.db.unreadMsg.push(msg);
        } else {
          this.db.readMsg.push(msg);
        }
      } catch (e) {
        core.error(e);
      }

    }, this);


    // remove any bad records as well...
    g.array.forEachRight(badMsgIndex, function (msgIndex, index){
      g.array.removeAt(this.db.messages, msgIndex);
    }, this);

  } catch (e) {
    core.error(e);
  }

}; // _parseData() method

/**
 * Get the compiled data object of
 * user's private messages
 *
 * @return {array}
 */
core.user.message.prototype.get = function ()
{
  try {

  // fuse the two data object arrays (unread and all the rest)
  return goog.array.concat(this.db.unreadMsg, this.db.readMsg);

  } catch (e) {
    core.error(e);
  }

};
/**
 * Get a specified by userId user data object
 *
 * user must exist in the message data object
 *
 * @param {Number} uId userId of user
 * @return {array}
 */
core.user.message.prototype.getUser = function (uId)
{
  try {

    if (!goog.isObject(this.db.users[uId]))
      return core.user.getDummyObject();

    return this.db.users[uId];

  } catch (e) {
    core.error(e);
  }

};


/**
 * Delete a private message
 *
 * @param {Number} msgId The id of the message we want to remove
 * @return {array}
 */
core.user.message.prototype.remove = function (msgId)
{
  try {
    var c = core, g = goog;
    var log = c.log('core.user.message.remove');

    var msgIndex = c.arFindIndex(this.db.messages, 'msgId', msgId);
    if (-1 == msgIndex) {
      // not found...
      log.warning('Could not locate msgId:' + msgId + ' in our local data object');
    } else {
      g.array.removeAt(this.db.messages, msgIndex);
      // recompile our data objects
      this._parseData();
    }


    // perform the post anyway, let server handle the rest...
    var aj = new c.ajax('/message/delete/' + msgId, {
      postMethod: 'POST'
     , showMsg: false // don't show default success message
     , showErrorMsg: false // don't show error message if it happens
    });

    // send ajax request
    aj.send();


  } catch (e) {
    core.error(e);
  }

};


/**
 * Set state to read for all the messages from specified user id
 *
 * @param {Number} uId
 * @return {void}
 */
core.user.message.prototype.readUser = function (uId)
{
  try {
    var c = core, g = goog;
    var log = c.log('core.user.message.readUser');

    log.info('Init. uId:' + uId);

    // first update our localy stored data object...
    g.array.forEach(this.db.messages, function(msgData, index){
      try {
        if (uId == msgData['from_userId'] && !msgData['is_read']) {
          msgData['is_read'] = true;
        }
      } catch (e) {
        core.error(e);
      }

    }, this);

    // re-render our localy stored data object
    this._parseData();

    // perform post on server for read event
    var aj = new c.ajax('/message/readUser/' + uId, {
      postMethod: 'POST'
     , showMsg: false // don't show default success message
     , showErrorMsg: false // don't show error message if it happens
    });


    aj.callback = function(result) {
      try {
        // see if we have total new messages set...
        var unread = aj.getTag('unread');
        if (g.isNumber(unread)) {
          log.info('We received new unread message number:' + unread);

          // inform notify engine
          c.user.notify.set('message', unread);

        }
      } catch (e) {
        core.error(e);
      }

    }

    // send ajax request
    aj.send();


  } catch (e) {
    core.error(e);
  }

};
