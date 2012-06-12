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
goog.provide('ss.user.auth.Twitter');
goog.provide('ss.user.auth.Twitter.EventType');

goog.require('ss.user.auth.PluginModule');
goog.require('ss.user.Auth');
goog.require('ss.user.auth.EventType');

/**
 * The Twitter auth constructor
 *
 * @constructor
 * @implements {ss.user.auth.PluginInterface}
 * @extends {ss.user.auth.PluginModule}
 */
ss.user.auth.Twitter = function()
{
  goog.base(this);
  
  /** @const {boolean} */
  this.LOCALAUTH = false;

  // register ourselves to main external auth class
  this._auth.addExtSource(this);
};
goog.inherits(ss.user.auth.Twitter, ss.user.auth.PluginModule);
goog.addSingletonGetter(ss.user.auth.Twitter);

/**
 * A logger to help debugging
 * @type {goog.debug.Logger}
 * @private
 */
ss.user.auth.Twitter.prototype.logger =  goog.debug.Logger.getLogger('ss.user.auth.Twitter');

/**
 * @type {ss.user.types.extSourceId} The plugin's name (e.g. Twitter)
 */
ss.user.auth.Twitter.prototype.sourceId = 'Twitter';

/**
 * Start initial authentication checks
 * When a definitive result is produced, dispatch the INITIALAUTHSTATUS
 * event
 *
 * @return {void}
 */
ss.user.auth.Twitter.prototype.initAuthCheck = function()
{
  this.logger.info('Init initAuthCheck(). Dispatching dummy event');
  
  this.dispatchEvent(ss.user.auth.EventType.INITIALAUTHSTATUS);
};

/**
 * Opens the login dialog or starts the authentication flow
 *
 * @param  {Function(boolean)=} opt_callback optional callback
 * @param {string=} opt_perms set permissions if we need to...
 *      comma separate them
 * @return {void}
 */
ss.user.auth.Twitter.prototype.login = function(opt_callback, opt_perms)
{
  // use the current path of the user for return
  var returnPath = '?url=' + ss.encURI(window.location.pathname);

  this.logger.info('Init login(). Return path:' + returnPath);

  // we have to redirect user to /signup/twitter.php
  // to start the authentication process
  
  // redirect the browser now
  window.location.href = ss.conf.auth.ext.twttr.loginUrl + returnPath;
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
ss.user.auth.Twitter.prototype._loginListener = function (response, callback)
{
  this.logger.info('Init _loginListener()');

  callback(this._isAuthedFromResponse(response));
};

/**
* Perform a logout action
*
* @return {void}
*/
ss.user.auth.Twitter.prototype.logout = function()
{
  this.logger.info('Init logout()');
  this._isAuthed = false;
  this.dispatchEvent(ss.user.auth.EventType.EXTAUTHCHANGE);
};

/**
 * If user is authed returns us a {@link ss.user.types.extSource}
 * data object
 * @return {ss.user.types.extSource|null} null if not authed
 */
ss.user.auth.Twitter.prototype.getUser = function()
{

};


