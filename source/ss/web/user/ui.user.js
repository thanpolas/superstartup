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


/**
 * Triggers when library is ready, we bind social
 *
 * @return {void}
 */
ss.web.user.ui.init = function ()
{
  try {
    var logger = goog.debug.Logger.getLogger('ss.web.user.ui.Init');

    logger.info('Init - Binding on login / logout elements');

    // catch all logout buttons / links
    $('.-logout').click(ss.web.user.login.logout);

    // bind login buttons for FB/TW
    ss.web.user.login.bindLogin();

  } catch (e) {
    ss.error(e);
  }

}; // ss.web.user.ui.Init
// listen for ready event
//ss.ready(ss.web.user.ui.init);




