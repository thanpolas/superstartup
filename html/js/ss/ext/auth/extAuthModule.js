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
  * @fileoverview The plugin superclass.
  */

goog.provide('ss.ext.auth.PluginModule');

goog.require('ss.Module');

/**
 * The basic plugin component class
 *
 * @constructor
 * @extends {ss.Module}
 */
ss.ext.auth.PluginModule = function() {
  goog.base(this);
  /**
   * The external main auth Class
   * @private
   * @type {ss.ext.auth.Main}
   */
  this._extMain = ss.ext.auth.Main.getInstance();
  // set ext auth main as the parent event target
  this.setParentEventTarget(this._extMain);
  
};
goog.inherits(ss.ext.auth.PluginModule, ss.Module);

/**
 * @private 
 * @type {boolean} External source's Auth switch
 */
ss.ext.auth.PluginModule.prototype._isAuthed = false;

/**
 * Used by our instance handlers to know if we have started
 * an auth crosscheck with local (server)
 * @type {boolean}
 */
ss.ext.auth.PluginModule.prototype.localAuthInit = false;


