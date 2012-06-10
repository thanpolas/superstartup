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
 * createdate 10/Jun/2012
 *
 *********
 */
 
/**
 * @fileoverview A single user data object
 */

goog.provide('ss.user.Item');

goog.require('ss.DynamicMap');

/**
 * A single user data object item, can be used both for 
 * public or private use. If private use (own user data object)
 * we extent the contained keys with the ss.user.types.ownuser
 * additional key/value pairs
 *
 * @constructor
 * @param {ss.user.types.user=} opt_user a user data object to init with
 * @extends {ss.DynamicMap}
 */
ss.user.Item = function(opt_user)
{
  goog.base(opt_user || ss.user.types.user);
};
goog.inherits(ss.user.Item, ss.DynamicMap);

/** @inheritDoc */
ss.user.Item.prototype.disposeInternal = function()
{
  // we used goog.mixin() to do multiple injeritance for 
  // events, thus we have to directly call event's disposeInternal
  goog.events.EventTarget.prototype.disposeInternal.call(this);

  // empty our data object
  this.clear();

};

