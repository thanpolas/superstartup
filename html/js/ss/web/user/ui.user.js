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
 * created on Jun 18, 2011
 * ui.user.js Users UI functions
 *
 */


goog.provide('ss.web.user.ui');



ss.web.user.ui.db = {
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
ss.web.user.ui.Init = function ()
{
  try {
    var win = window, j = win.jQuery, c = win.ss, w = c.web, g = win.goog;

    var log = c.log('ss.web.user.ui.Init');

    log.info('Init - Binding on login / logout elements');

    // catch all logout buttons / links
    j('.-logout').click(w.user.login.logout);
    
    // bind login buttons for FB/TW
    w.user.login.bindLogin();    


  } catch (e) {
    ss.error(e);
  }

}; // ss.web.user.ui.Init
// listen for ready event
ss.ready.addFunc('main', ss.web.user.ui.Init);




