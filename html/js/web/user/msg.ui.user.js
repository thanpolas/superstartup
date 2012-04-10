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
 * created on Jun 28, 2011
 * message.user.js.js [File Description]
 *
 */


goog.provide('web.user.ui.message');


goog.require('core.user.message');
goog.require('web.user.ui.msgCls');



/**
 * Triggers when DOM is ready, we do some binds
 *
 * @param {type}  description
 * @return {void}
 */
web.user.ui.message.Init = function ()
{
  try {
    var w = web, j = $, c = core;

    if (!w.BOOTH)
      return;
    
    var log = c.log('web.user.ui.message.Init');

    log.info('Init');

    j('#user_prof_msg_form').submit(w.user.ui.message.send);
    j('#user_prof_msg_btn').click(w.user.ui.message.send);
    // prepare parameters for text counter class
    var params = {
      jText: j('#user_prof_msg_text'),
      jCount: j('#user_prof_msg_counter'),
      maxChars: 140
    }
    // get a new instance of the textcounter
    w.user.ui.db.profileTextCounter = new w.ui.textCounter(params);

  } catch (e) {
    core.error(e);
  }

}; // web.user.ui.Init
// listen for ready event
core.ready.addFunc('main', web.user.ui.message.Init);


/**
 * Triggers when we have a private message send
 * from the user profile overlay. We reset the textarea
 *
 * @return {boolean} false to not submit
 */
web.user.ui.message.send = function ()
{
  try {
    var j = $, c = core, w = web;

    var log = c.log('web.user.ui.message.send');

    log.info('Init');

    j('#user_prof_msg_success').dispOff();
    j('#user_prof_msg_error').dispOff();

    // get the text value
    var message = j('#user_prof_msg_text').val();

    if (0 == message.length) {
      // empty message
      return false;
    }

    if (!c.throttle('web.user.ui.message.send', 2000))
      return false;



    // get the user data object
    var user = j('#user_prof_msg_text').data('user');

    // start loader
    var jload = j('#user_prof_msg_loader');
    jload.dispOn();

    // prepare params for sending message
    var params = {
      to_userId: user['userId'],
      message: message
    }
    var msg = new c.user.message();
    log.info('Performing submition of message');
    msg.submit(params, function(state, opt_msg){
      jload.dispOff();
      log.info('Got reply from submit. state:' + state + ' opt_msg:' + opt_msg);
      if (state) {
        j('#user_prof_msg_success').dispOn();
        // reset message...
        w.user.ui.db.profileTextCounter.reset();
      } else {
        j('#user_prof_msg_error').dispOn();
      }
    });


    return false;


  } catch (e) {
    core.error(e);
  }

}; // web.user.ui.message.send
