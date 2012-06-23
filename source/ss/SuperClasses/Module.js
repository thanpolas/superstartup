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
  * @fileoverview The default Module class.
  */

goog.provide('ss.Module');

goog.require('goog.events');
goog.require('goog.events.EventTarget');

/**
 * The basic Module class
 * 
 * @constructor
 * @extends {goog.events.EventTarget}
 */
ss.Module = function() {
  goog.base(this);
  /**
   * A config hash
   * @protected
   * @type {!Object}
   */
  this._config = {};  
};
goog.inherits(ss.Module, goog.events.EventTarget);