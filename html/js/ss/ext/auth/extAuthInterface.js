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
 * createdate 06/Jun/2012
 */

 /**
  * @fileoverview Defines the external auth plugins interface
  *     Every ext auth class must implement this interface
  */

goog.provide('ss.ext.auth.PluginInterface');

/**
 * The interface for external authentication plugins
 * @interface
 */
ss.ext.auth.PluginInterface = function() {};


/**
 * @type {ss.user.types.extSourceId} The plugin's name (e.g. Facebook)
 */
ss.ext.auth.PluginInterface.prototype.sourceId;

/**
 * @protected {boolean} Auth switch
 */
ss.ext.auth.PluginInterface.prototype._isAuthed;

/**
* Opens the login dialog or starts the authentication flow
*
* @param  {Function(boolean)=} opt_callback optional callback
* @param {string=} opt_perms set permitions if we need to...
*      comma separate them
* @return {void}
*/
ss.ext.auth.PluginInterface.prototype.login = function(opt_callback, opt_perms){};;

/**
* Perform a logout action
*
* @return {void}
*/
ss.ext.auth.PluginInterface.prototype.logout = function(){};

/**
 * Tells us if user is authenticated with service
 * @return {boolean}
 */
ss.ext.auth.PluginInterface.prototype.isAuthed = function(){};

/**
 * If user is authed returns us a {@link ss.user.types.extSource}
 * data object
 * @return {ss.user.types.extSource|null} null if not authed
 */
ss.ext.auth.PluginInterface.prototype.getUser = function(){};

/**
 * Starts initial authentication checks for the ext auth plugin
 * When a definitive result is produced, dispatch the INITIALAUTHSTATUS
 * event
 * @return {void}
 */
ss.ext.auth.PluginInterface.prototype.initAuthCheck = function(){};


