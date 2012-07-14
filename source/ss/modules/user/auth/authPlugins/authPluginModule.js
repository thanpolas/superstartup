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
 * createdate 09/Jun/2012
 */

 /**
  * @fileoverview The auth plugin superclass.
  */

goog.provide('ss.user.auth.PluginModule');

goog.require('ss.Module');
goog.require('ss.FancyGetSet');
goog.require('ss.user.Auth');

/**
 * The basic auth plugin class
 *
 * @constructor
 * @extends {ss.Module}
 */
ss.user.auth.PluginModule = function()
{
  goog.base(this);
  /**
   * The user auth Class
   * @private
   * @type {ss.user.Auth}
   */
  this._auth = ss.user.Auth.getInstance();

  // set auth main as the parent event target
  this.setParentEventTarget(this._auth);

  /**
   * @private
   * @type {boolean} External source's Auth switch
   */
  this._isAuthed = false;

  /**
   * Used by our instance handlers to know if we have started
   * an auth crosscheck with local (server)
   * @type {boolean}
   */
  this.localAuthInit = false;


};
goog.inherits(ss.user.auth.PluginModule, ss.Module);

/**
 * Current user is authenticated with (ext auth source) service
 * @return {boolean}
 */
ss.user.auth.PluginModule.prototype.isAuthed = function()
{
  return this._isAuthed;
};
