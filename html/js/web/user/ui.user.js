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
 *
 *********
 * created on Jun 18, 2011
 * ui.user.js Users UI functions
 *
 */


goog.provide('web.user.ui');

goog.require('web.ui.textCounter');
goog.require('web.user.ui.message');
goog.require('web.user.ui.menu');
goog.require('core.user.notify');

web.user.ui.db = {
  menuOpen: false,
  profileTextCounter: null,
  msgCls: null,
  getMailInit: false,
  getMailOpen: false
};

/**
 * Triggers when DOM is ready, we do some binds
 *
 * @return {void}
 */
web.user.ui.Init = function ()
{
  try {
    var w = web, j = $, c = core;

    var log = c.log('web.user.ui.Init');

    log.info('Init');

    // listen for new notifications event
    c.user.notify.hookNew(w.user.ui.setNotify);

    // catch all logout buttons / links
    j('.-logout').click(w.user.login.logout);
    
    // bind login buttons for FB/TW
    w.user.login.bindLogin();    


  } catch (e) {
    core.error(e);
  }

}; // web.user.ui.Init
// listen for ready event
core.ready.addFunc('main', web.user.ui.Init);

/**
 * Triggers when we have a new user.
 *
 * This is currently called from TagLanderParse...
 *
 * but in the future should include functionality from
 * inline authentication flows (FB) when new user
 *
 * @return {void}
 */
web.user.ui.newUser = function ()
{
  try {
    var w = web,  c = core;

    var log = c.log('web.user.ui.newUser');

    log.info('Init');

    // check if new user is from Twitter
    if (c.user.auth.hasExtSource(c.STATIC.SOURCES.TWIT)) {
      // now check that we don't have an e-mail
      var u = c.user.getUserDataObject();
      log.info('Newuser is from twitter. email:' + u.email);
      if ('' == u.email) {
        // show getemail modal
        w.user.ui.openGetEmailModal();
      }
    }
  } catch (e) {
    core.error(e);
  }

}; // web.user.ui.newUser

/**
 * Will open the get-email modal and ask user to enter e-mail
 *
 * @param {boolean=}  opt_isOldUser set to true if user is not new
 * @return {void}
 */
web.user.ui.openGetEmailModal = function (opt_isOldUser)
{
  try {
    var w = web, j = $, c = core;

    var log = c.log('web.user.ui.getEmailModal');

    log.info('Init. Modal Open:' + w.user.ui.db.getMailOpen);

    // check if already open
    if (w.user.ui.db.getMailOpen)
      return;
    w.user.ui.db.getMailOpen = true;

    var jOver = j('#getmail');
    jOver.dispOn();

    // get user data, chop nick to 9 chars so it fits ok
    var u = c.user.getUserDataObject();
    j('#getmail_title_nick').text(u.nickname.substr(0,9));

    // now check if not new user
    if (opt_isOldUser) {
      // change welcome to 'hey'
      j('#getmail_title_prefix').text('Hey');
      j('#getmail_content').text("We don't seem to have your e-mail, please type it here");
    }


    // check if we have already binded to events
    if (w.user.ui.db.getMailInit)
      return;

    w.user.ui.db.getMailInit = true;

    // bind events
    j('#getmail_form').submit(w.user.ui.getEmailSubmit);
    j('#getmail_submit').click(w.user.ui.getEmailSubmit);

  } catch (e) {
    core.error(e);
  }
}; // web.user.ui.getEmailModal

/**
 * Handles submition of the get Email modal form
 *
 * @param {type} e description
 * @return {void}
 */
web.user.ui.getEmailSubmit = function (e)
{
  try {
    var w = web, j = $, c = core;

    var log = c.log('web.user.ui.getEmailSubmit');

    log.info('Init');

    // show the loader
    j('#getmail_submit').css('visibility', 'hidden');
    j('#getmail_loader').css('display', 'inline');

    // we'll cheat and use the submit account
    // methods....
    // collect the data...
    var u = c.user.getUserDataObject();
    var datafields = {
      nickname: u.nickname,
      email: j('#getmail_textfield').val()
    };

    c.user.profile.submitAccount(datafields, function(status, opt_errmsg){
      try {
        log.info('Submit Callback. status:' + status + ' opt_errmsg:' + opt_errmsg);
        j('#getmail_submit').css('visibility', 'visible');
        j('#getmail_loader').dispOff();

        if (status) {
          // profile submitted successfuly
          w.ui.alert('Thank you', 'success');
          w.user.ui.db.getMailOpen = false;
          j('#getmail').dispOff();

          // create GA event ???
          //c.analytics.trackEvent('UserMenu', 'account_saved');


        } else {
          // error in submition
          w.ui.alert(opt_errmsg, 'error');
        }


      } catch (e) {
        core.error(e);
      }

    });

    return false;

  } catch (e) {
    core.error(e);
    j('#getmail_submit').css('visibility', 'visible');
    j('#getmail_loader').dispOff();
    return false;
  }

}; // web.user.ui.getEmailSubmit
