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
 * created on Sep 16, 2011
 * alerts.user.js email alert notification settings for user
 *
 */


goog.provide('web.user.alerts');




/**
 * Handles UI when we open the email alerts tab
 *
 * @return {void}
 */
web.user.alerts.open = function ()
{
  try {
    var j = $, c = core, g = goog;

    var log = c.log('web.user.alerts.open');

    log.info('Init');

    // get user settings (if they exist)
    var u = c.user.getUserDataObject();

    if (!g.isObject(u.settings))
      return;

    if (!g.isObject(u.settings.alerts))
      return;

    // now check current alert settings and apply
    if (!u.settings.alerts.mentions)
      j('#alerts_mentions').attr('checked', false);
    if (!u.settings.alerts.frameComments)
      j('#alerts_frame_comments').attr('checked', false);
    if (!u.settings.alerts.messages)
      j('#alerts_messages').attr('checked', false);



    // track page view
    c.analytics.trackPageview('/usersettings/alerts');


  } catch (e) {
    core.error(e);
  }

}; // web.user.alerts.open


/**
 * Initialize on page load and bind needed events
 *
 * @return {void}
 */
web.user.alerts.Init = function()
{
  try {
    var j = $, w = web;
    j('#um_tab_alerts_form').submit(w.user.alerts.submit);
    j('#prof_alerts_save').click(w.user.alerts.submit);
  } catch (e) {
    core.error(e);
  }

};
// listen for ready event and run after 1500ms
core.ready.addFunc('main', web.user.alerts.Init, 1500);


/**
 * Triggers when we have form submit for email alerts
 *
 * @param {type} event description
 * @return {void}
 */
web.user.alerts.submit = function (event)
{
  try {
    var w = web, j = $, c = core, g = goog;

    var log = c.log('web.user.alerts.submit');

    log.info('Init');


    // show the loader
    j('#prof_alerts_save').css('visibility', 'hidden');
    j('#prof_alerts_save_loader').dispOn();


    // collect the fields...
    var datafields = {
      mentions: j('#alerts_mentions').is(':checked'),
      frameComments: j('#alerts_frame_comments').is(':checked'),
      messages: j('#alerts_messages').is(':checked')
    };


    c.user.profile.submitAlerts(datafields, function(status, opt_errmsg){
      try {
        log.info('Submit Callback. status:' + status + ' opt_errmsg:' + opt_errmsg);
        j('#prof_alerts_save').css('visibility', 'visible');
        j('#prof_alerts_save_loader').dispOff();

        if (status) {
          web.ui.alert('Alerts saved!', 'success');
        } else {
          web.ui.alert(opt_errmsg, 'error');
        }

        // create GA event
        c.analytics.trackEvent('UserMenu', 'alerts_saved');

      } catch (e) {
        core.error(e);
      }

    });
    // track the account submit as a pageview (for funnel vis on GA)
    c.analytics.trackPageview('/usersettings/alerts-submit');

  } catch (e) {
    core.error(e);
    $('#prof_alerts_save').css('visibility', 'visible');
    $('#prof_alerts_save_loader').dispOff();

  }


}; // web.user.alerts.submit
