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
 * createdate 09/Mar/2012
 *
 */
 
goog.provide('web.myapp');
goog.provide('web.myapp.initialise');
goog.require('core');
goog.require('web.user.login');
 

/**
 * Start when our framework is ready
 * and perform initialising operations
 * (page bindings, etc etc)
 *
 * @return {void}
 */
web.myapp.initialise = function()
{
  try {

    var w = web, c = core;

    var log = c.log('web.myapp.initialise');  
    
    log.info('Hello World!');
    

    

    
  } catch (e) {
    core.error(e);
  }  
};

// bind to the framework's ready event
core.ready.addFunc('ready', web.myapp.initialise);



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
web.myapp.newUser = function()
{
  try {
    var w = web,  c = core;

    var log = c.log('web.myapp.newUser');

    log.info('Init');
    
    //TODO refactor it...
    return;

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
    
    
    // do a pageview after 2"
    setTimeout(function(){
      c.analytics.trackPageview('/mtr/users/new');
    }, 2000);
    // track on MixPanel
    c.analytics.trackMP('newUser', {source:'TW'});    
    
    
  } catch (e) {
    core.error(e);
  }

}; // web.user.ui.newUser

/**
 * Triggers when the master auth event hook changes state
 *
 * @param {boolean} state If we are authed or not
 * @param {core.STATIC.SOURCES=} if authed, which auth source was used
 * @param {object=} opt_userDataObject if authed, the user data object is passed here
 * @return {void}
 */
web.myapp.authState = function(state, opt_sourceId, opt_userDataObject)
{
  try {

    var w = web, c = core, j = jQuery, g = goog;

    var log = c.log('web.myapp.authState');  
    
    log.info('Auth event is ready. State:' + state);
    
    if (state) {
      // user is authed, get his data object...
      var u = opt_userDataObject;
      // now update our page...
      j('#auth_state h3').text('User Authed');
      j('#auth_state_content h4').text('The user data object');
      j('#user_data_object').text(g.debug.deepExpose(u));
      // make #login invisible
      j('#login').dispOff();
      j('#logged_in').dispOn();
    } else {
      j('#auth_state h3').text('Not Authed');
      j('#auth_state_content h4').text('');
      j('#user_data_object').text('');
      j('#login').dispOn();
      j('#logged_in').dispOff();  
    }
    
  } catch (e) {
    core.error(e);
  }  
};

// subscribe to the auth state master event hook
core.user.auth.events.addEventListener('authState', web.myapp.authState);

// listen for newuser event
core.user.auth.events.addEventListener('newUser', web.myapp.newUser);


/*

w.user.auth.events.runEvent('tw_click', elId);

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


*/