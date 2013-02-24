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
 *
 *
 *
 *********
 * created on Sep 27, 2011
 */

 /**
  * @fileoverview Configuration Class. Set a default configuration hash,
  *       allow for any type of editing and in the end validate given
  *       configuration
  */

goog.provide('ssd.Config');
goog.require('ssd.debug');
goog.require('ssd.FancyGetSet');
goog.require('ssd.StringPath');

/**
 * A generic config setter / getter
 *
 * @constructor
 * @extends {ssd.FancyGetSet}
 */
ssd.Config = function()
{
  goog.base(this);

  /**
   * override the internal storage object.
   * @type {ssd.StringPath}
   * @private
   */
  this._obj = new ssd.StringPath();

  /**
   * override get/toObject methods with the ones
   * from StringPath class
   */
  this.get = goog.bind( this._obj.get, this._obj );
  this.toObject = goog.bind( this._obj.toObject, this._obj );

  /**
   * And now expose methods from StringPath class to
   * our instance
   */
  this.containsKey = goog.bind( this._obj.containsKey, this._obj );

};
goog.inherits(ssd.Config, ssd.FancyGetSet);
goog.addSingletonGetter(ssd.Config);

/** @enum {string} Error strings this class throws */
ssd.Config.Error = {
  methodRemoved: 'method not supported'
};

/**
 * A logger to help debugging
 * @type {goog.debug.Logger}
 * @private
 */
ssd.Config.prototype.logger =  goog.debug.Logger.getLogger('ssd.Config');


/**
 * Use this setter to setup the original (default) configuration.
 * All key / value pairs passed through this method will
 * validate anything passed via the set() method.
 *
 * This method will also protect you from overwritting previously
 * set paths / keys by throwing an Error
 *
 * @param {string} path a string path
 * @param {Object} objConf an Object with the key/value pairs
 * @return {void}
 */
ssd.Config.prototype.register = function(path, objConf)
{
  this.logger.config('Registering: ' + path);

  /* @preserveTry */
  try {
    this.get(path, true);
    throw new Error('Key / path already exists:' + path);
  } catch(e) {
    // good, doesn't exist, move on
  }

  // set to own map
  this.set(path, objConf);
};

/**
 * Set and do validations:
 * Current validations include:
 * - Type checking. If the set value is of same type as the one set
 *      via this method.
 * - Overwrite checking. We cannot overwrite keys / path
 * - No objects allowed. Objects are not allowed as value
 *
 * @param {string} key The key.
 * @param {*} value we accept any type and validate it.
 * @throws Errors depending on validation checks.
 */
ssd.Config.prototype.set = function(key, value)
{
  this.logger.fine('Setting: ' + key);

  // check if value is object
  if (goog.isObject(value)) {
    throw new TypeError('value for "' + key + '" cannot be object type');
  }

  // get the value from original config with the throw ReferenceError
  // parameter set to true.
  var val;
  var exists = true;

  /* @preserveTry */
  try {
    val = this._obj.get(key, true);
  } catch(e) {
    exists = false;
  }

  // if the key exists do a type check
  if (exists && goog.typeOf(value) !== goog.typeOf(val)) {
    throw new TypeError('Expected:' + goog.typeOf(val) + ' got:' + goog.typeOf(value) + ' for:' + key);
  }

  // call the original set method
  this._obj.set.call(this._obj, key, value);
};
