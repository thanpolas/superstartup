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

goog.require('ssd.DynamicMap');
goog.require('ssd.user.types');

/**
 * A single user data object item.
 *
 * This is intented for public user data objects. e.g. other users'
 * data objects. This class is extented by ssd.user.OwnItem which
 * represents the current logged in user's data object
 *
 * @constructor
 * @param {ssd.user.types.user=} opt_user a user data object to init with
 * @extends {ssd.DynamicMap}
 */
ssd.user.Item = function(opt_user)
{
  ssd.DynamicMap.call(this, opt_user || ssd.user.types.user);
};
goog.inherits(ssd.user.Item, ssd.DynamicMap);

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


ssd.user.auth.Facebook.prototype._loadExtAPI = function ()
{
  try {
    this.logger.info('_loadExtAPI() :: Init. FB API Loading:' + this._FBAPILoading + ' Loaded:' + this._FBAPILoaded);

    if (this._FBAPILoaded || this._FBAPILoading) {
      return;
    }

    // If JS API loading is closed by config, we assume the API has been loaded
    // synchronously
    if (!this.config('loadFBjsAPI')) {
      this.logger.warning('JS API load is closed from Config. Assuming API loaded synchronously');
      this.extAPIloaded();
      return;
    }


    // capture FB API Load event
    goog.global['fbAsyncInit'] = goog.bind(this._extAPIloaded, this);

    // request the facebook api
    var el = document.createElement('script');
    if (ssd.DEVEL) {
      src = '//' + this.config('jsAPIdebug');
    } else {
      src = '//' + this.config('jsAPI');
    }
    el['src'] = src;
    el['async'] = true;
    document.getElementById('fb-root').appendChild(e);

  } catch(e){
    ssd.error(e);
  }
};

