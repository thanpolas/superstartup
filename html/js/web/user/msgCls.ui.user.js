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
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 *
 *
 *********
 * created on Jul 1, 2011
 * msgcls.ui.user.js handles all events and ui elements of the user's PMs
 *
 */


goog.provide('web.user.ui.msgCls');
goog.require('core.events.listeners');
goog.require('core.user.message');
//goog.require('web.ui.dialogs');

/**
 * The class that handles all events and ui elements of the
 * user's private messages UI
 *
 * @constructor
 * @extends {core.events.listeners}
 */
web.user.ui.msgCls = function ()
{
  var c = core, g = goog, w = web, j = $;
  c.events.listeners.call(this);

  this.db = {
    haveData: false,
    coreMsg: null,
    msgData: null,
    allUserIds: new Array(),
    currentUserId: 0,
    textCounter: null, // text counter class
    // indicates if our form is open, set to true
    // it is required for the startup sequence to run smoothly
    formOpen: true,
    nomessages: false


  };

  // attach on notification engine and listen for
  // new messages
  c.user.notify.hookNew(g.bind(this._newMessage, this), 'message');


  // bind events on inline message send form
  j('#pane_right_header_form').submit(g.bind(this._send, this));
  j('#pane_right_header_form_btn').click(g.bind(this._send, this));
  // prepare parameters for text counter class
  var params = {
    jText: j('#pane_right_header_form_message'),
    jCount: j('#pane_right_header_counter'),
    maxChars: 140
  }
  j('#pane_right_header_form_message').focus(g.bind(this.openForm, this));
  // get a new instance of the textcounter
  this.db.textCounter = new w.ui.textCounter(params);


};
goog.inherits(web.user.ui.msgCls, core.events.listeners);




/**
 * This method must be called whenever we open to see
 * the private messages.
 *
 * We check if they are already loaded up or we request
 * them from the server and start rendering them when ready
 *
 * @return {void}
 */
web.user.ui.msgCls.prototype.open = function ()
{
  try {
    var c = core, g = goog, j = $;
    var log = c.log('web.user.ui.msgCls.open');

    log.info('Init. haveData:' + this.db.haveData);
    // check if we need to do anything
    if (this.db.haveData) {
      c.analytics.trackPageview('/message');
      return;
    }


    // reset variables used
    this.db.allUserIds = new Array();
    // clear left pane
    j("#um_tab_msg_left_items").empty();
    // show loader
    j("#um_tab_msg_left_loader").dispOn();

    // reset currentUserId
    this.db.currentUserId = 0;

    // check if nomessages was on
    if (this.db.nomessages)
      this._resetUI();
    // so we have never opened... get the instance of core.message
    // class and retrieve message data...
    this.db.coreMsg = c.user.message.get()

    // fetch user's messages from server and check state
    this.db.coreMsg.getFromServer(g.bind(function(state, opt_msg){
      try {
        if (!state) {
          // we have a problem
          // hide loader
          j("#um_tab_msg_left_loader").dispOff();

          log.warning('core.user.message.getFromServer returned false:' + opt_msg);

          this._noMessages();
          return;
        }

        // we got messages, retrieve them
        this.db.msgData = this.db.coreMsg.get();
        this.db.haveData = true;
        // hide loader
        j("#um_tab_msg_left_loader").dispOff();
        this.renderAll();

        c.analytics.trackPageview('/message');


      } catch (e) {
        core.error(e);
        // hide loader
        j("#um_tab_msg_left_loader").dispOff();

      }

    }, this));

  } catch (e) {
    core.error(e);
  }

};


/**
 * Will render all initial messages we have in our
 * data object
 *
 * @return {void}
 */
web.user.ui.msgCls.prototype.renderAll = function ()
{
  try {
    var c = core, g = goog, j = $;
    var log = c.log('web.user.ui.msgCls.renderAll');

    log.info('Init');

    if (g.isNull(this.db.msgData)) {
      log.warning('No messages to render!!');
      return;
    }



    // go through all the messages
    g.array.forEach(this.db.msgData, function(msgData, index){
      try {
        this._renderUser(msgData);

      } catch (e) {
        core.error(e);
      }

    }, this);

    // Add hover and click events to user elements now
    this._addEventsUser();

    // and now trigger click for the first item
    j("#um_tab_msg_left_items .msg_item").first().click();

  } catch (e) {
    core.error(e);
  }

};

/**
 * Will render a single user that has send us a message
 * or we have send him.
 *
 * This method fills the left side, and we only append a user
 * we have not seen before.
 *
 *
 * @param {object} msgData a single message data object including the user
 * @param {boolean=} opt_new set to true if the added message is new (we'll
 *      prepend)
 * @private
 * @return {void}
 */
web.user.ui.msgCls.prototype._renderUser = function(msgData, opt_new)
{
  try {
    var g = goog, c = core, j = $;
    var log = c.log('web.user.ui.msgCls._renderUser');

    // get other user's data object
    var u = msgData['user'];
    // get user's external auth source data object
    var uExt = c.web2.getUserExt(u);
    // get other user's id
    var uId = u['userId'];


    // check if we have already rendered this user
    if (g.array.contains(this.db.allUserIds, uId)) {

      // add up the counter num and display it
      var jNum = j('.msg-uid-' + uId + ' .msg_item_total');
      var total = jNum.data('total');
      total++;
      jNum.data('total', total);
      jNum.text(total);
      return;

    }
    // add user
    this.db.allUserIds.push(uId);

    // new user, clone template
    var jQmsg = j("#templates .msg_item").clone();

    // set user's photo
    jQmsg.find('.msg_item_photo img').attr('src', uExt['extProfileImageUrl']);

    // save user data object on item_name
    jQmsg.find('.msg_item_name').data('user', this.db.coreMsg.getUser(uId));
    // set nickname
    jQmsg.find('.msg_item_name strong').text(u['nickname']);
    // set user full name
    jQmsg.find('.msg_item_name b').text(u['fullname']);
    // set time
    var dt = new c.date(msgData['createDatetime']);
    jQmsg.find('.msg_item_date').text(dt.getDiffStringAgo(true));

    // set total messages number
    jQmsg.find('.msg_item_total').text('1');
    // save it
    jQmsg.find('.msg_item_total').data('total', 1);

    // check if we have unread messages in this user...
    if (!msgData['is_read'] && c.user.getUserId() == msgData['to_userId']) {

      // unread message, display unread
      jQmsg.find('.msg_item_unread').dispOn();
    }

    // tag the item
    jQmsg.addClass('msg-uid-' + uId);

    if (opt_new)
      j("#um_tab_msg_left_items").prepend(jQmsg);
    else
      if (j("#um_tab_msg_left_items").children().length)
        j("#um_tab_msg_left_items .msg_item").last().after(jQmsg);
      else
        j("#um_tab_msg_left_items").append(jQmsg);










  } catch (e) {
    core.error(e);
  }

};


/**
 * Add events for newly rendered user elements
 * (left pane)
 *
 * @private
 * @return {void}
 */
web.user.ui.msgCls.prototype._addEventsUser = function ()
{
  try {
    var j = $, c = core, g = goog;
    var log = c.log('web.user.ui.msgCls._addEventUser');

    log.info('Init');

    var jItem = j('#um_tab_msg_left_items .msg_item');

    // create hover event listeners for item_onover
    jItem.hover(function(event){
      j(this).addClass('msg_item_hover');
      j(this).find('.msg_item_total').addClass('msg_item_total_hover');
    }, function(event){
      j(this).removeClass('msg_item_hover');
      j(this).find('.msg_item_total').removeClass('msg_item_total_hover');
    });

    // don't add user click event here, confusing

    jItem.click(g.bind(this.selectItem, this));


  } catch (e) {
    core.error(e);
  }


};

/**
 * Will select a specific left pane item (user)
 *
 * This is called as a click event
 *
 * @param {object} event jQuery event object
 * @return {void}
 */
web.user.ui.msgCls.prototype.selectItem = function(event)
{
  try {

    var c = core, w = web, j = $;
    var log = c.log('web.user.ui.msgCls.selectItem');

    var jItem = j(event.currentTarget);
    var uId = w.ui.cssId(jItem, 'msg-uid-');

    log.info('Click on item with uId:' + uId + ' prev current uId:' + this.db.currentUserId);
    // if clicked on same user, exit
    if (this.db.currentUserId == uId)
      return;
    // setup environment
    this.db.currentUserId = uId;
    this.resetForm();

    // remove selected from any left items
    j('#um_tab_msg_left_items .msg_item').removeClass('msg_item_selected');

    // add selected item class
    jItem.addClass('msg_item_selected');

    // now render all the messages from/to this user
    this._showMessages(uId);

    // mark user as read if wasn't read
    // first remove any ui ico
    jItem.find('.msg_item_unread').dispOff();

    // now inform server
    this.db.coreMsg.readUser(uId);

    // and get the refreshed message data object
    this.db.msgData = this.db.coreMsg.get();

  } catch (e) {
    core.error(e);
  }

};

/**
 * Shows messages on the right pane based on given user id
 *
 * @param {Number} uId
 * @return {void}
 * @private
 */
web.user.ui.msgCls.prototype._showMessages = function(uId)
{
  try {

    var g = goog, j = $;

    // clear the right pane content
    j(".pane_right_content").empty();

    // go through all the messages and fetch this user's ones and render them
    g.array.forEach(this.db.msgData, function (msg, index){
      try {
        // see if this message is for the user we are looking for
        if (uId == msg['user']['userId'])
          // yes it is, render it
          this._renderMessage(msg);
      } catch (e) {
        core.error(e);
      }

    }, this);

    // add events to new elements
    this._addEventsMessage();



  } catch (e) {
    core.error(e);
  }

};


/**
 * Renders the right pane with a message based on given message
 * data object
 *
 * @param {Object} msg One message data object
 * @return {void}
 * @private
 */
web.user.ui.msgCls.prototype._renderMessage = function(msg)
{
  try {

    var c = core, w = web, j = $, g = goog;

    // get other user's data object
    var u = msg['user'];
    // get user's external auth source data object
    var uExt = c.web2.getUserExt(u);
    // get message id
    var msgId = msg['msgId'];

    // check if we are sender
    var sender = false;
    if (c.user.getUserId() == msg['from_userId']) {
      var user = c.user.getUserDataObject();
      var userExt = c.web2.getUserExt(user);
      sender = true;
    }


    // new message, clone template
    var jQmsg = j("#templates .msg_item").clone();

    // set cursor to default mode
    jQmsg.css('cursor', 'default');

    // set user's photo
    jQmsg.find('.msg_item_photo img').attr('src', (sender ? userExt['extProfileImageUrl'] : uExt['extProfileImageUrl']));
    jQmsg.find('.msg_item_photo img').attr('height', '48');
    jQmsg.find('.msg_item_photo img').attr('width', '48');

    // save user data object on item_name
    jQmsg.find('.msg_item_name').data('user', (sender ? user : u));

    // set nickname
    jQmsg.find('.msg_item_name strong').text((sender ? user['nickname'] : u['nickname']));
    // set time
    var dt = new c.date(msg['createDatetime']);
    jQmsg.find('.msg_item_date').text(dt.getDiffStringAgo(true));

    // insert the message
    jQmsg.find('.msg_item_message').html(w.chat.parse.parse(msg['message']));

    // find delete link and add msgId data
    jQmsg.find('.msg_item_delete').data('msgId', msgId);

    // add msgId as a pseudo class and as data
    jQmsg.addClass('msg-msgid-' + msgId).data('msgId', msgId);

    // inject the snippet
    j(".pane_right_content").append(jQmsg);

  } catch (e) {
    core.error(e);
  }

};


/**
 * Add events for newly rendered message elements
 * (right pane)
 *
 * @private
 * @return {void}
 */
web.user.ui.msgCls.prototype._addEventsMessage = function ()
{
  try {
    var j = $, c = core, g = goog, w = web;
    var log = c.log('web.user.ui.msgCls._addEventsMessage');

    log.info('Init');

    var jItems = j('.pane_right_content .msg_item');

    // create hover event listeners for item_onover
    jItems.hover(function(event){
      j(this).find('.msg_item_delete').css('visibility', 'visible');
    }, function(event){
      j(this).find('.msg_item_delete').css('visibility', 'hidden');
    });

    jItems.find('.msg_item_delete').click(g.bind(this._clickDelete, this));

    jItems.find('.msg_item_name').click(w.user.ui.profOpenData);


  } catch (e) {
    core.error(e);
  }


};


/**
 * Click on delete link for message displayed
 * (right pane)
 *
 * @private
 * @param {object} event jQuery event object
 * @return {void}
 */
web.user.ui.msgCls.prototype._clickDelete = function (event)
{
  try {
    var j = $, c = core, w = web, g = goog;
    var log = c.log('web.user.ui.msgCls._clickDelete');

    log.info('Init');

    var jItem = j(event.currentTarget);
    var msgId = jItem.data('msgId');

    log.info('Click on message delete for msgId:' + msgId);

    w.ui.dialogs.yesNo('Are you sure you want to delete this message?',
      g.bind(function(reply)
      {
        log.info('Got reply for delete:' + reply);
        // if not exit
        if (!reply)
          return;

        // remove the element from the DOM
        j('.msg-msgid-' + msgId).remove();

        // remove it also from our local data object
        var msgIndex = c.arFindIndex(this.db.msgData, 'msgId', msgId);
        if (-1 == msgIndex)
          log.warning('Could not locate msgId:' + msgId + ' in our local data object');
        else
          g.array.removeAt(this.db.msgData, msgIndex);

        // reset have data
        this.db.haveData = false;

        // ready to perform server delete
        this.db.coreMsg.remove(msgId);

      }, this));



  } catch (e) {
    core.error(e);
  }


};

/**
 * Triggers when we have new messages to display
 *
 * For now we only reset the haveData but maybe this method
 * should evolve to something more active in case the message menu is
 * already open...
 *
 * @param {Number} newMessages How many new messages exist
 * @return {void}
 * @private
 */
web.user.ui.msgCls.prototype._newMessage = function (newMessages)
{
  try {
    this.db.haveData = false;
  } catch (e) {
    core.error(e);
  }

};



/**
 * Triggers when we have a private message send
 * from the user profile overlay. We reset the textarea
 *
 * @return {boolean} false to not submit
 * @private
 */
web.user.ui.msgCls.prototype._send = function ()
{
  try {
    var j = $, c = core, w = web, g = goog;;

    var log = c.log('web.user.ui.msgCls._send');

    log.info('Init');

    j('#pane_right_header_form_success').dispOff();
    j('#pane_right_header_form_error').dispOff();

    // get the text value
    var message = j('#pane_right_header_form_message').val();

    if (0 == message.length) {
      // empty message
      return false;
    }

    if (!c.throttle('web.user.ui.msgCls.prototype._send', 2000))
      return false;



    // get the user data object
    var user = this.db.coreMsg.getUser(this.db.currentUserId);

    // start loader
    var jload = j('#pane_right_header_form_loader');
    jload.dispOn();

    // prepare params for sending message
    var params = {
      to_userId: user['userId'],
      message: message
    }
    var msg = new c.user.message();
    log.info('Performing submition of message');
    msg.submit(params, g.bind(function(state, opt_msg){
      jload.dispOff();
      log.info('Got reply from submit. state:' + state + ' opt_msg:' + opt_msg);
      if (state) {
        j('#pane_right_header_form_success').dispOn();
        // reset message...
        this.db.textCounter.reset();
        // force re-render next time we open user menu
        this.db.haveData = false;
        // TODO inject new message in DOM
      } else {
        j('#pane_right_header_form_error').dispOn();
      }
    }, this));


    return false;


  } catch (e) {
    core.error(e);
  }

};

/**
 * Resets the send message form to it's original state
 *
 * @return {void}
 */
web.user.ui.msgCls.prototype.resetForm = function ()
{
  try {
    var j = $;

    // get the user data object
    var user = this.db.coreMsg.getUser(this.db.currentUserId);
    j('._pane_right_header_nick').text(user['nickname']);


    if (!this.db.formOpen)
      return
    this.db.formOpen = false;

    j('#pane_right_header_form_success').dispOff();
    j('#pane_right_header_form_error').dispOff();
    j("#pane_right_header_form_message").attr('rows', 1);
    j("#pane_right_header_form_message").css('padding', '0 5px 0 5px');
    j("#pane_right_header_counter").dispOff();
    j("#pane_right_header_form_btn").dispOff();
    j(".pane_right_header").height(60);
    this.db.textCounter.reset();
    web.user.ui.menu.resize();

  } catch (e) {
    core.error(e);
  }

};

/**
 * Opens the form
 *
 * @return {void}
 */
web.user.ui.msgCls.prototype.openForm = function ()
{
  try {
    if (this.db.formOpen)
      return
    this.db.formOpen = true;
    var j = $;
    j(".pane_right_header").height(120);
    web.user.ui.menu.resize();
    j('#pane_right_header_form_success').dispOff();
    j('#pane_right_header_form_error').dispOff();
    j("#pane_right_header_form_message").attr('rows', 2);
    j("#pane_right_header_form_message").css('padding', '5px 5px 6px 5px');
    j("#pane_right_header_counter").dispOn();
    j("#pane_right_header_form_btn").dispOn();
  } catch (e) {
    core.error(e);
  }

};


/**
 * Let's us know if the message send form is open or not
 *
 * @return {boolean}
 */
web.user.ui.msgCls.prototype.formOpen = function ()
{
  return this.db.formOpen;
};



/**
 * When user has no messages execute this method
 * to prepare the UI properly
 *
 * To cancel these effects use this._resetUI()
 *
 * @return {void}
 */
web.user.ui.msgCls.prototype._noMessages = function ()
{
  try {

    var j = $;
    this.db.nomessages = true;
    j('#um_tab_msg_left_nomessage').dispOn();
    j('.pane_right_inner').dispOff();

  } catch (e) {
    core.error(e);
  }

};

/**
 * Restores UI after we displayed 'no messages' dialogue
 *
 *
 * @return {void}
 * @private
 */
web.user.ui.msgCls.prototype._resetUI = function ()
{
  try {

    var j = $;
    this.db.nomessages = false;
    j('#um_tab_msg_left_nomessage').dispOff();
    j('.pane_right_inner').dispOn();

  } catch (e) {
    core.error(e);
  }

};