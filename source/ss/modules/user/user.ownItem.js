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

goog.provide('ssd.user.OwnItem');
goog.require('ssd.user.Item');

/**
 * The currently logged in user's data object.
 *
 * @constructor
 * @param {ssd.user.types.user=} opt_user a user data object to init with
 * @extends {ssd.user.Item}
 */
ssd.user.OwnItem = function(opt_user)
{
  goog.base(this);
};
goog.inherits(ssd.user.OwnItem, ssd.user.Item);


/**
 * The authed users data object validator.
 *
 * Checks that the data object provided (by our server?) is proper and
 * we can use it.
 *
 * @param  {Object} dataObj The data object we want to validate.
 * @return {boolean} If the object validates.
 */
ssd.user.OwnItem.prototype.validate = function (dataObj)
{
  // prepare and emit BEFORE VALIDATE event, check if
  // we got a preventDefault or similar...
  var eventObj = {
      type: ssd.user.auth.EventType.USERDATA_BEFORE_VALIDATE,
      'data': dataObj
  };
  if (!this.dispatchEvent(eventObj)) {
    return false;
  }

  ssd.user.OwnItem.superClass_.validate.call(this, dataObj);
  return true;
};