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
        
    var win = window, j = jQuery, s = ss, w = s.web;
    var log = s.log('ss.web.user.login.logout');

    log.info('Init. Authed:' + s.isAuthed());

    if (!s.isAuthed())
      return;
    
    var elId = j(this).attr('id');
    // trigger the logout click event
    w.user.auth.events.runEvent('logout_click', elId);

    // perform logout
    s.user.login.logout(function(status){
      log.info('logout callback received. status:' + status);
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

  var win = window, j = $, c = ss, w = c.web, g = goog;

  var log = c.log('ss.web.user.login.bindLogin');

  // bind click events on FB / TWITTER LOGIN BUTTONS
  j(".-login-tw").click(function(event){
    try {
        event.preventDefault();
        var elId = j(this).attr('id');
        log.info('Twitter login clicked:' + elId);

        c.twit.loginOpen();

        w.user.auth.events.runEvent('tw_click', elId);

      } catch (e) {
        ss.error(e);
      }

  });

  j(".-login-fb").click(function(event){
    try {
        event.preventDefault();
        // get id of element that triggered the event
        var elId = j(this).attr('id');
        var jel = j(this);
        log.info('Facebook login clicked:' + elId);

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
              jel.click();
            }
          });

          // facebook not ready yet
          return;
        }


        // launch facebook login dialog
        c.fb.loginOpen(function(state){
          log.info('Login return state:' + state);
          w.user.auth.events.runEvent('fb_click_reply', state);
        });

        // trigger the facebook click event now
        w.user.auth.events.runEvent('fb_click', elId);

      } catch (e) {
        ss.error(e);
      }

  });

  } catch (e) {
    ss.error(e);
  }


};