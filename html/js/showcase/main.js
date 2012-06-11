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
 * Superstartup showcase bootstrap file
 *
 */

goog.provide('showcase');
goog.require('ss');

goog.require('showcase.widget.showObject');

showcase.init = function() {
  try {
  var logger = goog.debug.Logger.getLogger('showcase.init');

  logger.info('Starting...');
  
  var jCombo = $('#comboBox');
  if (!jCombo.length)
    return;
  showcase.so = new showcase.widget.showObject({
    comboBox: jCombo,
    displayBox: $('#showObjects')
  });
  
  showcase.so.addObject('userObject', 'The user data object', 'ss.user.getUserDataObject()', ss.user.getUserDataObject);
  showcase.so.addObject('userDummyObject', 'A dummy user data object', 'ss.user.getDummyObject()', ss.user.getDummyObject);

  showcase.so.render();
  
  } catch(e) {ss.error(e);}
};




/**
 * Triggers when the master auth event hook changes state
 *
 * @param {boolean} state If we are authed or not
 * @param {ss.STATIC.SOURCES=} if authed, which auth source was used
 * @param {object=} opt_userDataObject if authed, the user data object is passed here
 * @return {void}
 */
showcase.authState = function(state, opt_sourceId, opt_userDataObject)
{

    var c = ss, w = c.web, j = jQuery, g = goog;

    var log = goog.debug.Logger.getLogger('showcase.authState');  
    
    log.info('Auth event is ready. State:' + state);
    
    if (state) {
      // user is authed, get his data object...
      var u = opt_userDataObject;
      // now update our page...
      $('#auth_state h3').text('User Authed');
      $('#auth_state_content h4').text('The user data object');
      $('#user_data_object').text(goog.debug.deepExpose(u));
      // make #login invisible
      $('#login').css('display', 'none');
      $('#logged_in').css('display', 'block');
    } else {
      $('#auth_state h3').text('Not Authed');
      $('#auth_state_content h4').text('');
      $('#user_data_object').text('');
      $('#login').css('display', 'block');
      $('#logged_in').css('display', 'none');  
    }
    
};

// subscribe to the auth state master event hook
//ss.user.auth.events.addEventListener('authState', showcase.authState);

// When Superstartup lib is ready, trigger our code
ss.ready(showcase.init);

