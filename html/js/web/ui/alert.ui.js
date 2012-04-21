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
* Web UI alert file (the messaging box)
* createdate 25/May/2011
*
*/

goog.provide('web.ui.alert');




/**
 * Will display the main messagebox warning window.
 * Values for type:
 *  error :: Error message (default)
 *  warning :: A warning message
 *  info :: Informational message
 *  success :: An operation completed succesfully type of message
 *
 * @param {string} msg The message you want to output
 * @param {string=} opt_type The type of the alert
 * @param {jQuery=} opt_jqel jQuery Element we want to apply the alert to
 * @return {void}
 */
web.ui.alert = function (msg, opt_type, opt_jqel)
{
    var w = web;
    var c = core;
    var ui = w.ui;
    var g = goog;
    var j = $;
    var log = g.debug.Logger.getLogger('web.ui.alert');

    var type = opt_type || 'error';

    log.shout('Init - type:' + type + ' msg:' + msg);


}; // method web.ui.alert
