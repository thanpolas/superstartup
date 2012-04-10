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
 *
 *********
 * created on Aug 16, 2011
 * profile-form.user.js Main handler for profile form
 *
 */


goog.provide('web.user.profileForm');





/**
 * Triggers after a while DOM is ready, we do some binds
 *
 * @return {void}
 */
web.user.profileForm.Init = function ()
{
  try {
    var w = web, j = $, c = core;
    if (!w.BOOTH)
      return;

    var log = c.log('web.user.profileForm.Init');

    log.info('Init');



    //bind form submit
    j('#prof_prof_save').click(w.user.profileForm.submit);
    j('#um_tab_profile_form').submit(w.user.profileForm.submit);



  } catch (e) {
    core.error(e);
  }

}; // web.user.profileForm.Init

// listen for ready event and run after 1900ms
core.ready.addFunc('main', web.user.profileForm.Init, 1900);

/**
 * Triggers when we open the profile tab
 * We set any values we know and track pageview
 *
 * @return {void}
 */
web.user.profileForm.open = function ()
{
  try {
    var w = web, j = $, c = core, g = goog;

    var log = c.log('web.user.profileForm.open');
    log.info('Settings field values and tracking page view');

    // fill the values to the input boxes
    var u = c.user.getUserDataObject();
    j('#prof_fullname').val(u['fullname']);
    j('#prof_location').val(u['profile']['location']);
    j('#prof_web').val(u['profile']['web']);
    j('#prof_bio').val(u['profile']['bio']);

    // track page view
    c.analytics.trackPageview('/usersettings/profile');


  } catch (e) {
    core.error(e);
  }

}; // web.user.profileForm.open



/**
 * Executes when profile form is submited
 *
 * @param {object} e jQuery event object
 * @return {void}
 */
web.user.profileForm.submit = function (e)
{
  try {
    var w = web, j = $, c = core;

    var log = c.log('web.user.profileForm.submit');

    log.info('Init');

    // show the loader
    j('#prof_prof_save').css('visibility', 'hidden');
    j('#prof_prof_save_loader').dispOn();


    // collect the fields...
    var datafields = {
      fullname: j('#prof_fullname').val(),
      location: j('#prof_location').val(),
      web: j('#prof_web').val(),
      bio: j('#prof_bio').val()
    };

    c.user.profile.submitProfile(datafields, function(status, opt_errmsg){
      try {
        log.info('Submit Callback. status:' + status + ' opt_errmsg:' + opt_errmsg);
        j('#prof_prof_save').css('visibility', 'visible');
        j('#prof_prof_save_loader').dispOff();

        if (status) {
          web.ui.alert('Saved ok!', 'success');
        } else {
          web.ui.alert(opt_errmsg, 'error');
        }

        // create GA event
        c.analytics.trackEvent('UserMenu', 'profile_saved');

      } catch (e) {
        core.error(e);
      }

    });
    // track the account submit as a pageview (for funnel vis on GA)
    c.analytics.trackPageview('/usersettings/profile-submit');

  } catch (e) {
    core.error(e);
    $('#prof_prof_save').css('visibility', 'visible');
    $('#prof_prof_save_loader').dispOff();

  }

}; // web.user.profileForm.submit
