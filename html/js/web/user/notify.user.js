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
 *
 *
 *********
 * created on Aug 24, 2011
 * notify.user.js User notifications handler
 *
 */


goog.provide('web.user.notify');

goog.require('goog.string');

/**
 * Static db
 */
web.user.notify.db = {
  haveData : false,
  staticData: []
};



/**
 * Trigger when page loads, setup a hook on notifications engine
 *
 * @return {void}
 */
web.user.notify.Init = function ()
{
  try {

    // hook and listen for new notifications
    core.user.notify.hookNew(web.user.notify.newNotify, 'notifications');

  } catch (e) {
    core.error(e);
  }

};
core.ready.addFunc('main', web.user.notify.Init, 200);

/**
 * Opens the notify tab on the user menu
 *
 * @return {void}
 */
web.user.notify.open = function ()
{
  try {
    var w = web, j = $, c = core;
    // more shortcuts...
    var db = w.user.notify.db;

    var log = c.log('web.user.notify.open');

    log.info('Init. Have data:' + db.haveData);


    if (db.haveData) {
      c.analytics.trackPageview('/notifications');
      return;
    }

    // reset html spaces and show loader...
    j('#notify_loader').dispOn();
    j('#notify_item_master').empty();



    // fetch new data
    c.user.notify.getStaticFromServer(function(status, opt_errmsg){
      log.info('Notify Callback. status:' + status);
      j('#notify_loader').dispOff();
      if (!status) {
        // failed...
        j('#notify_nomessages').dispOn();
        return;
      }

      // get the retrieved data object
      db.staticData = c.user.notify.getStatic();
      db.haveData = true;

      w.user.notify.renderAll();

      // remove the badges
      c.user.notify.set('notifications', 0);
    });



  } catch (e) {core.error(e);}

}; // web.user.notify.open


/**
 * Will render the notifications page
 *
 * @param {type}  description
 * @return {void}
 */
web.user.notify.renderAll = function ()
{
  try {
    var w = web, j = $, c = core, g = goog;
    var db = w.user.notify.db;

    var log = c.log('web.user.notify.renderAll');

    log.info('Init');

    if (!g.isArray(db.staticData)) {
      log.warning('db.staticData not array!');
      return;
    }

    var jc = j('#notify_item_master');

    g.array.forEach(db.staticData, function(item, index){
      try {
        switch(item['type']) {
          case 'frameComment':
            jc.append(w.user.notify.renderFrameComment(item));
          break;
          case 'mention':
            jc.append(w.user.notify.renderMention(item));
          break;


        }
      } catch (e) {
        core.error(e);
      }

    });

  } catch (e) {
    core.error(e);
  }

}; // web.user.notify.renderAll


/**
 * We will render a frame comment notification
 *
 * @param {object} data Data passed by server
 * @return {jQuery}
 */
web.user.notify.renderFrameComment = function(data)
{
  try {
    var j = $, c = core, w = web, g = goog;
    var n = w.user.notify;
    // sample line:


    // first get a cloned copy of our template
    var jc = j('#notify_templates .notify_item').clone();
    var dt = new c.date(data['createDatetime']);
    jc.children('.notify_item_date').text(dt.smallDatetime());


    // check if we have a 'from user'
    if (0 != data['data']['fromUserId']) {
      // we have a from user
      jc.children('.notify_item_content').append(n._getUser(data['data']['fromUserData']));
      jc.children('.notify_item_content').append('commented on your frame');
    } else {
      jc.children('.notify_item_content').append('<span>You have comments on your frame</span>');
    }


    // now go for the frame text which will be in quotes...
    jc.children('.notify_item_content').append(n._getFrame(data['data']));

    // add the data object to the jQ element
    jc.data('data', data);


    return jc;

  } catch (e) {
    core.error(e);
  }

};



/**
 * We will render a user mention notification
 *
 * @param {object} data Data passed by server
 * @return {jQuery}
 */
web.user.notify.renderMention = function(data)
{
  try {
    var j = $, c = core, w = web, g = goog;
    var n = w.user.notify;
    // sample line:


    // first get a cloned copy of our template
    var jc = j('#notify_templates .notify_item').clone();
    var dt = new c.date(data['createDatetime']);
    jc.children('.notify_item_date').text(dt.smallDatetime());


    // from user...
    jc.children('.notify_item_content').append(n._getUser(data['data']['fromUserData']));
    jc.children('.notify_item_content').append('mentioned you on frame');


    // now go for the frame text which will be in quotes...
    jc.children('.notify_item_content').append(n._getFrame(data['data']));

    // add the data object to the jQ element
    jc.data('data', data);


    return jc;

  } catch (e) {
    core.error(e);
  }

};



/**
 * Render a username to use in the notifications text
 *
 * @param {object} userData A standard user data object
 * @return {jQuery}
 */
web.user.notify._getUser = function (userData)
{
  try {
    var j = $, w = web;

    var element = '<a href="#" class="notify_item_user" ';

    element += ' title="' + userData['nickname'] + '">' + userData['nickname'] + '</a>';

    var jel = j(element);
    // add events
    jel.click(function(ev){
      w.user.ui.profOpen(userData)
    });

    return jel;


  } catch (e) {
    core.error(e);
  }

};


/**
 * Get a frame link for the notifications
 *
 * We also include a click event binding that opens the
 * frame modal
 *
 * @param {object} data The full notification data object
 * @return {jQuery}
 */
web.user.notify._getFrame = function (data)
{
  try {
    var g = goog, j = $;

    var frameText = '"';
    frameText += g.string.truncateMiddle(data['frameData']['text'], 25);
    frameText += '"';
    var frameTextHtml = '<a href="' + data['frameData']['frameUrl'] + '"';
    frameTextHtml += ' target="_blank"';

    frameTextHtml += ' class="notify_item_frametext link">' + frameText + '</a>';

    var jel = j(frameTextHtml);

    jel.click(function(e){
      try {
        e.preventDefault();
        chat.ui.openFrameModal(data['frameData'], data['fromUserData']);
      } catch (e) {
        core.error(e);
      }

    });

    return jel;


  } catch (e) {
    core.error(e);
  }

};

/**
 * Triggers whenever we have new notifications
 *
 * Our job is to update the badge on the 'notifications' tab
 * in the user menu
 *
 * @param {Number} notifyCount how many new notifications we have
 * @return {void}
 */
web.user.notify.newNotify = function (notifyCount)
{
  try {
    var w = web, j = $;

    var log = core.log('web.user.notify.newNotify');

    log.shout('Init. notifyCount:' + notifyCount);

    var jBadge = j('#um_tab_notify_badge');

    jBadge.empty();
    jBadge.dispOff();

    if (0 < notifyCount) {
      jBadge.text(notifyCount);
      jBadge.dispOn();
      w.user.notify.db.haveData = false;
    }

  } catch (e) {
    core.error(e);
  }

};