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
 * createdate 25/May/2011
*
*/



goog.provide('web.user.login');

/**
 * Logs out a user
 *
 * @param {object} event jQuery event object
 * @return {void}
 */
web.user.login.logout = function (event)
{
  try {
    event.preventDefault();
        
    var w = web,  c = core;

    var log = c.log('web.user.login.logout');

    log.info('Init. Authed:' + c.isAuthed());

    if (!c.isAuthed())
      return;



    // perform logout
    c.user.login.logout(function(status, opt_errmsg){
      // no matter the status, we will logout the user...
      log.info('logout callback received. status:' + status + ' opt_errmsg:' + opt_errmsg);
    });


  } catch (e) {
    core.error(e);
  }

}; // web.user.login.logout


/**
 * Executes whenever we have an authentication event
 *
 * @param {type}  description
 * @return {void}
 */
web.user.login.initLogin = function ()
{
  try {
    var w = web, c = core, j = $;

    var log = c.log('web.user.login.initLogin');

    log.info('Init');

    if (w.SFV)
      return;

    j("#chat_container").dispOn();

    // if we already run while authed, exit
    if (w.ui.db.footSetandAuthed)
      return;
    w.ui.db.footSetandAuthed = true;



    // check if camera is live
    if (w.webcam.isCameraOn()) {
      chat.ui.formOnOff(true);
      log.info('Opening camera monitor!');
      // if we have camera live, show the monitor
      w.webcam.ui.openCamMonitor();
    }
    else
      chat.ui.formOnOff(false);


    var u = c.user.getUserDataObject();


    j("#chat_user_image img").attr('src', u['extSource'][0]['extProfileImageUrl']);
    j("#chat_user_name").text(u['nickname']);


    j("#main_history_login").dispOff();

    /**
     * Now attach to bottom scroll to load older
     * frames
     *
     */
    if (true) { // lock open for now
      if (w.SFV || w.PAGE)
        return;
        log.info('Seting up bottom scroll');
        //var bscroll = new w.ui.bottomScroll(j("#main"), j(".main_holder"));
        var bscroll = new w.ui.bottomScroll(j(window), j(".main_holder"));
        bscroll.addEvent('bottom', w.ui.reachedFrameBottom);
    }

    /**
     * Get any notifications and listen for new ones
     *
     */
    w.user.ui.setNotify();


    // check if we have user's e-mail, if not ask for it
    // forcibly
    log.shout('Checking if we have e-mail:' + u.email);
    if ('' == u.email)
      w.user.ui.openGetEmailModal(true);


  } catch (e) {
    core.error(e);
  }

}; // web.user.login.initLogin

/**
 * Will bind to click event for Twitter and Facebook connect
 * buttons
 *
 * @return {void}
 */
web.user.login.bindLogin = function()
{
  try {

  var w = web, c = core, j = $, win = window;

  var log = c.log('web.user.login.bindLogin');

  // bind click events on FB / TWITTER LOGIN BUTTONS
  j(".-login_tw").click(function(event){
    try {
        event.preventDefault();
        var elId = j(this).attr('id');
        log.info('Twitter login clicked:' + elId);


        // start the loader
        w.ui.loaderOpen('Waiting for twitter.com ...');
        c.twit.loginOpen();


        switch (elId) {
          case 'login_twitter':
            c.analytics.trackEvent('Auth', 'twitterLoginClick');
          break;
          case 'main_history_login_twitter':
            c.analytics.trackEvent('Auth', 'twitterLoginClickkHistory');
          break;
          case 'login_twitter_front':
            c.analytics.trackEvent('Auth', 'twitterLoginClickFrontpage');
          break;


        }

      } catch (e) {
        core.error(e);
      }

  });

  j(".-login_fb").click(function(event){
    try {
        event.preventDefault();
        // get id of element that triggered the event
        var elId = j(this).attr('id');
        log.info('Facebook login clicked:' + elId);

        if (!c.throttle('fb_login_click', 3000, true)) {
          log.info('Execution canceled by throttler');
          return;
        }

        // check if facebook ready
        if (!c.fb.haveAuthStatus()) {
          if (w.db.fbClicked) {
            return;
          }
          log.info('Facebook library not ready yet, created a listener and we now wait...');
          w.db.fbClicked = true;
          // listen for FB auth event...
          c.ready.addFunc('fb-auth', function(){
            w.db.fbClicked = false;
            if (!c.isAuthed()) {
              // call ourselves
              j("._login_fb").click();
            }
          });

          // facebook not ready yet
          return;
        }


        // launch facebook login dialog
        c.fb.loginOpen(function(state){
          log.info('Logged in. state:' + state);
        });


        switch (elId) {
          case 'login_facebook':
            c.analytics.trackEvent('Auth', 'facebookLoginClick');
          break;
          case 'main_history_login_facebook':
            c.analytics.trackEvent('Auth', 'facebookLoginClickHistory');
          break;
          case 'login_facebook_front':
            c.analytics.trackEvent('Auth', 'facebookLoginClickFrontpage');
          break;
        }

      } catch (e) {
        core.error(e);
      }

  });

  } catch (e) {
    core.error(e);
  }


};