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
    

    
    // subscribe to the auth state master event hook
    c.web2.events.addEventListener('initAuthState', w.myapp.authState);
    
  } catch (e) {
    core.error(e);
  }  
};

// bind to the framework's ready event
core.ready.addFunc('ready', web.myapp.initialise);



/**
 * Triggers when the master auth event hook changes state
 *
 * @param {boolean} state If we are authed or not
 * @return {void}
 */
web.myapp.authState = function(state)
{
  try {

    var w = web, c = core, j = jQuery, g = goog;

    var log = c.log('web.myapp.authState');  
    
    log.info('Auth event is ready. State:' + state);
    
    if (state) {
      // user is authed, get his data object...
      var u = c.user.getUserDataObject();
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
