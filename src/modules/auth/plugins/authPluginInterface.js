/*jshint expr:true */

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

goog.provide('ssd.user.auth.PluginInterface');

/**
 * The interface for external authentication plugins
 * @interface
 */
ssd.user.auth.PluginInterface = function(){};

/**
 * @const {ssd.user.types.extSourceId} The plugin's name (e.g. Facebook)
 */
ssd.user.auth.PluginInterface.prototype.SOURCEID;

/**
 * @const {boolean} If this plugin needs to follow up authentication
 *         with the server. If set to true then  you also need
 *         to define the 'getAccessToken' method
 */
ssd.user.auth.PluginInterface.prototype.LOCALAUTH;

/**
 * Used by the instance handlers to know if we have started
 * an auth crosscheck with local (server)
 * @type {boolean}
 */
ssd.user.auth.PluginModule.prototype.localAuthInit;

/**
 * @protected
 * @type {boolean} Auth switch
 */
ssd.user.auth.PluginInterface.prototype._isAuthed;

/**
 * Return the sourceId
 * @return {ssd.user.types.extSourceId} the SOURCEID.
 */
ssd.user.auth.PluginInterface.prototype.getSourceId = function(){};

/**
 * Certain third-party authentication providers offer a JS
 * API we can use to perform operations client-side (FB, g+...)
 * @return {boolean} if the plugin has a JS API.
 */
ssd.user.auth.PluginInterface.prototype.hasJSAPI = function(){};


/**
* Opens the login dialog or starts the authentication flow
*
* @param  {Function(boolean)=} opt_callback optional callback
* @param {string=} opt_perms set permissions if we need to...
*      comma separate them
* @return {void}
*/
ssd.user.auth.PluginInterface.prototype.login = function(opt_callback, opt_perms){};

/**
* Perform a logout action
*
* @return {void}
*/
ssd.user.auth.PluginInterface.prototype.logout = function(){};

/**
 * Tells us if user is authenticated with service
 * @return {boolean}
 */
ssd.user.auth.PluginInterface.prototype.isAuthed = function(){};

/**
 * If user is authed returns a {@link ssd.user.types.extSource}
 * data object
 * @return {ssd.user.types.extSource|null} null if not authed
 */
ssd.user.auth.PluginInterface.prototype.getUser = function(){};

/**
 * Starts off the plugin.
 * (async) Loads any required JS API.
 * And performs initial authentication checks
 * When a definitive result is produced, dispatches the INITIAL_AUTH_STATUS
 * event
 * @return {void}
 */
ssd.user.auth.PluginInterface.prototype.init = function(){};

/**
 * Returns the oAuth access token.
 *
 * This method is required if LOCALAUTH is true.
 *
 * This method is mocked in the authPluginModule and returns
 * an empty string.
 *
 * @return {string} The oAuth access token.
 */
ssd.user.auth.PluginInterface.prototype.getAccessToken = function(){};

/**
 * The local config of the ext auth plugin
 *
 * @private
 * @type {Object}
 */
ssd.user.auth.PluginInterface.prototype._config;

/**
 * A fancy setter / getter instance
 * Manages the local config (_config)
 *
 * @type {ssd.fancyGetSet}
 */
ssd.user.auth.PluginInterface.prototype.config;
