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
 * createdate 25/Oct/2010
 *
 *********
 */


/**
 * @fileoverview The main facebook auth functionality
 *
 */
goog.provide('ssd.user.auth.Twitter');
goog.provide('ssd.user.auth.Twitter.EventType');

goog.require('ssd.user.auth.PluginModule');
goog.require('ssd.user.Auth');
goog.require('ssd.user.Auth.EventType');

/**
 * The Twitter auth constructor
 *
 * @constructor
 * @implements {ssd.user.auth.PluginInterface}
 * @extends {ssd.user.auth.PluginModule}
 */
ssd.user.auth.Twitter = function()
{
  goog.base(this);

  /** @const {boolean} */
  this.LOCALAUTH = false;

  this.config('authUrl', '/users/twitter');
  // name of GET param to use when redirecting for twitter
  // oAuth login, which will contain the current url so
  // we know where to redirect the user once he/she comes
  // back from Twitter
  this.config('returnPathParam', 'url');

  // register our configuration
  ssd.Config.getInstance().register(ssd.user.auth.Twitter.CONFIG_PATH, this.config.toObject());

  // register ourselves to main external auth class
  this._auth.addExtSource(this);
};
goog.inherits(ssd.user.auth.Twitter, ssd.user.auth.PluginModule);
goog.addSingletonGetter(ssd.user.auth.Twitter);

/**
 * String path that we'll store the config
 * @const {string}
 */
ssd.user.auth.Twitter.CONFIG_PATH = 'user.auth.twitter';

/**
 * A logger to help debugging
 * @type {goog.debug.Logger}
 * @private
 */
ssd.user.auth.Twitter.prototype.logger =  goog.debug.Logger.getLogger('ssd.user.auth.Twitter');

/**
 * @const {ssd.user.types.extSourceId} The plugin's name (e.g. Twitter)
 */
ssd.user.auth.Twitter.prototype.SOURCEID = 'twitter';

/**
 * Start initial authentication checks
 * When a definitive result is produced, dispatch the INITIAL_AUTH_STATUS
 * event
 *
 * @return {void}
 */
ssd.user.auth.Twitter.prototype.init = function()
{
  this.logger.info('Init init(). Dispatching dummy event');

  this.dispatchEvent(ssd.user.Auth.EventType.INITIAL_AUTH_STATUS);
};

/**
 * Opens the login dialog or starts the authentication flow
 *
 * @param  {Function(boolean)=} opt_callback optional callback
 * @param {string=} opt_perms set permissions if we need to...
 *      comma separate them
 * @return {void}
 */
ssd.user.auth.Twitter.prototype.login = function(opt_callback, opt_perms)
{
  // use the current path of the user for return
  var returnPath = '?' + this.config('returnPathParam') + '=' + ssd.encURI(window.location.pathname);

  this.logger.info('Init login(). Return path:' + returnPath);

  // we have to redirect user to /signup/twitter.php
  // to start the authentication process

  // redirect the browser now
  window.location.href = this.config('loginUrl') + returnPath;
};

/**
 * Twitter Login Listener.
 * We listen for the completion of the fb login modal
 *
 * @private
 * @param {object} response
 * @param {Function(boolean)} callback
 * @return {void}
 */
ssd.user.auth.Twitter.prototype._loginListener = function (response, callback)
{
  this.logger.info('Init _loginListener()');

  callback(this._isAuthedFromResponse(response));
};

/**
* Perform a logout action
*
* @return {void}
*/
ssd.user.auth.Twitter.prototype.logout = function()
{
  this.logger.info('Init logout()');
  this._isAuthed = false;
  this.dispatchEvent(ssd.user.Auth.EventType.EXT_AUTH_CHANGE);
};

/**
 * If user is authed returns us a {@link ssd.user.types.extSource}
 * data object
 * @return {ssd.user.types.extSource|null} null if not authed
 */
ssd.user.auth.Twitter.prototype.getUser = function()
{

};


