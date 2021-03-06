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
 * createdate 02/Sep/2012
 */

 /**
  * @fileoverview An extension of goog.events.EventTarget. We used to
  *               have a reason but now we don't ... stays here
  *               till it's determined that this extension is
  *               not necessary
  */

goog.provide('ssd.events.EventTarget');

goog.require('goog.events');
goog.require('goog.events.EventTarget');

/**
 * Extends the goog.events.EventTarget class
 *
 * @constructor
 * @extends {goog.events.EventTarget}
 */
ssd.events.EventTarget = function() {
  goog.base(this);

};
goog.inherits(ssd.events.EventTarget, goog.events.EventTarget);
