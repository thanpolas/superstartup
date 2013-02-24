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

goog.provide('ssd.Module');

goog.require('ssd.events.EventTarget');
/**
 * The basic Module class
 *
 * @constructor
 * @extends {ssd.events.EventTarget}
 */
ssd.Module = function() {
  goog.base(this);

  /**
   * A fancy setter / getter instance
   * Manages the local config
   *
   * @type {ssd.fancyGetSet}
   */
  this.config = new ssd.FancyGetSet();
};
goog.inherits(ssd.Module, ssd.events.EventTarget);

