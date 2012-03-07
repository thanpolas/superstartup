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
 * created on Aug 15, 2011
 * account.user.js User Menu Account main handler
 *
 */


goog.provide('web.user.account');
goog.provide('web.user.account.ui');




/**
 * Triggers after a while DOM is ready, we do some binds
 *
 * @return {void}
 */
web.user.account.Init = function ()
{
  try {
    var w = web, j = $, c = core;

    var log = c.log('web.user.account.Init');

    log.info('Init');

    // profile link in fullname field
    j('#um_account_profile_link').click(function(){
      w.user.ui.menu.db.menutabs.setSelectedTabIndex(2)
    });

    //bind form submit
    j('#um_account_save').click(w.user.account.submit);
    j('#um_account_form').submit(w.user.account.submit);



  } catch (e) {
    core.error(e);
  }

}; // web.user.ui.Init
// listen for ready event and run after 900ms
core.ready.addFunc('main', web.user.account.Init, 900);


/**
 * Triggers when we open the account tab of the user menu
 *
 * @return {void}
 */
web.user.account.open = function ()
{
  try {
    var w = web, j = $, c = core, g = goog;

    var log = c.log('web.user.account.open');

    log.info('Init. Seting field values and tracking pageview');

    // fill the values to the input boxes
    var u = c.user.getUserDataObject();
    j('#um_account_fullname').text(u['fullname']);
    j('#um_account_nickname').val(u['nickname']);
    j('#um_account_email').val(u['email']);

    // track page view
    c.analytics.trackPageview('/usersettings/account');

  } catch (e) {
    core.error(e);
  }

}; // web.user.account.open



/**
 * Executes when account form is submited
 *
 * @param {object} e jQuery event object
 * @return {void}
 */
web.user.account.submit = function (e)
{
  try {
    var w = web, j = $, c = core;

    var log = c.log('web.user.account.submit');

    log.info('Init');

    // show the loader
    j('#um_account_save').css('visibility', 'hidden');
    j('#um_account_save_loader').dispOn();

    // collect the fields...
    var datafields = {
      nickname: j('#um_account_nickname').val(),
      email: j('#um_account_email').val()
    };

    c.user.profile.submitAccount(datafields, function(status, opt_errmsg){
      try {
        log.info('Submit Callback. status:' + status + ' opt_errmsg:' + opt_errmsg);
        j('#um_account_save').css('visibility', 'visible');
        j('#um_account_save_loader').dispOff();


        if (status) {
          // profile submitted successfuly
          w.ui.alert('Saved ok!', 'success');

          // update nickname fields in the page
          j('#user_menu_title').text(c.user.getNickname());
          j('#chat_user_name').text(c.user.getNickname());

          // create GA event
          c.analytics.trackEvent('UserMenu', 'account_saved');


        } else {
          // error in submition
          w.ui.alert(opt_errmsg, 'error');
        }


      } catch (e) {
        core.error(e);
      }

    });

    // track the account submit as a pageview (for funnel vis on GA)
    c.analytics.trackPageview('/usersettings/account-submit');


  } catch (e) {
    core.error(e);
    $('#um_account_save').css('visibility', 'visible');
    $('#um_account_save_loader').dispOff();

  }

}; // web.user.account.submit





