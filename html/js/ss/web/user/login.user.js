/**
 * Copyright 2000-2011 Athanasios Polychronakis. Some Rights Reserved.
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
 * createdate 25/May/2011
 *
 */

goog.provide('ss.web.user.login');

/**
 * Logs out a user
 *
 * @param {object} event jQuery event object
 * @return {void}
 */
ss.web.user.login.logout = function (event)
{
  try {
    event.preventDefault();
    var logger = goog.debug.Logger.getLogger('ss.web.user.login.logout');

    logger.info('Init. Authed:' + ss.isAuthed());

    if (!ss.isAuthed())
      return;

    var elId = $(this).attr('id');
    // trigger the logout click event
    ss.user.auth.events.runEvent('logout_click', elId);

    // perform logout
    ss.user.login.logout(function(status){
      logger.info('logout callback received. status:' + status);
    });


  } catch (e) {
    ss.error(e);
  }

}; // ss.web.user.login.logout



/**
 * Will bind to click event for Twitter and Facebook connect
 * buttons
 *
 * @return {void}
 */
ss.web.user.login.bindLogin = function()
{
  try {
  var logger = goog.debug.Logger.getLogger('ss.web.user.login.bindLogin');

  // bind click events on FB / TWITTER LOGIN BUTTONS
  $(".-login-tw").click(function(event){
    try {
        event.preventDefault();
        var elId = $(this).attr('id');
        logger.info('Twitter login clicked:' + elId);

        ss.twit.loginOpen();

        ss.web.user.auth.events.runEvent('tw_click', elId);

      } catch (e) {
        ss.error(e);
      }

  });

  $(".-login-fb").click(function(event){
    try {
        event.preventDefault();
        // get id of element that triggered the event
        var elId = $(this).attr('id');
        var jel = $(this);
        logger.info('Facebook login clicked:' + elId);

        // check if facebook ready
        if (!ss.fb.haveAuthStatus()) {
          if (ss.web.user.db.fbClicked) {
            return;
          }
          logger.info('Facebook library not ready yet, created a listener and we now wait...');
          ss.web.user.db.fbClicked = true;
          // listen for FB auth event...
          ss.ready('fb-auth').addListener(function(){
            ss.web.user.db.fbClicked = false;
            if (!ss.isAuthed()) {
              // call ourselves
              jel.click();
            }
          });

          // facebook not ready yet
          return;
        }


        // launch facebook login dialog
        ss.fb.loginOpen(function(state){
          logger.info('Login return state:' + state);
          ss.web.user.auth.events.runEvent('fb_click_reply', state);
        });

        // trigger the facebook click event now
        ss.web.user.auth.events.runEvent('fb_click', elId);

      } catch (e) {
        ss.error(e);
      }

  });

  } catch (e) {
    ss.error(e);
  }


};