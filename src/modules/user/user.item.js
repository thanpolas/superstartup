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

goog.provide('ssd.user.Item');
goog.provide('ssd.user.Item.EventType');

goog.require('ssd.structs.DynamicMap');
goog.require('ssd.user.types');

/**
 * A single user data object item.
 *
 * This is intented for public user data objects. e.g. other users'
 * data objects. This class is extented by ssd.user.OwnItem which
 * represents the current logged in user's data object
 *
 * @constructor
 * @param {ssd.user.types.user=} optUser a user data object to init with
 * @extends {ssd.structs.DynamicMap}
 */
ssd.user.Item = function(optUser)
{
  ssd.structs.DynamicMap.call(this, optUser || ssd.user.types.user);
};
goog.inherits(ssd.user.Item, ssd.structs.DynamicMap);

/**
 * Events triggered by this class
 * @enum {string}
 */
ssd.user.Item.EventType = {
  BEFORE_VALIDATE: 'beforeValidate',
  AFTER_VALIDATE: 'afterValidate'
};



/**
 * The users data object validator.
 *
 * Checks that the data object provided (by our server?) is proper and
 * we can use it.
 *
 * @param  {Object} dataObj The data object we want to validate.
 * @return {boolean} If the object validates.
 */
ssd.user.Item.prototype.validate = function (dataObj)
{

  return true;
};


/** @inheritDoc */
ssd.user.Item.prototype.disposeInternal = function()
{
  // we used goog.mixin() to do multiple inheritance for
  // events, thus we have to directly call event's disposeInternal
  goog.events.EventTarget.prototype.disposeInternal.call(this);

  // empty our data object
  this.clear();
};



