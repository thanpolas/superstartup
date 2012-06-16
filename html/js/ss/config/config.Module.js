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

goog.provide('ss.Config');

goog.require('ss.StringPath');


/**
 * A generic config setter / getter
 *
 * @constructor
 * @extends {ss.StringPath}
 */
ss.Config = function()
{
  goog.base(this);

  this._origConf = new ss.StringPath();

};
goog.inherits(ss.Config, ss.StringPath);
goog.addSingletonGetter(ss.Config);

/** @enum {string} Error strings this class throws */
ss.Config.Error = {
  methodRemoved: 'This method has been removed from this Class'
};

/**
 * Use this setter to setup the original (default) configuration.
 * All key / value pairs passed through this method will
 * validate anything passed via the set() method.
 *
 * This method will also protect you from overwritting previously 
 * set paths / keys by throwing an Error
 *
 * @param {string} path a string path
 * @param {Object} selfObj an Object or an instance of ss.Module
 * @return {void}
 */
ss.Config.prototype.register = function(path, selfObj)
{
  var exists = true;
  try {
    this._origConf.get(path, true);
  } catch(e) {
    exists = false;
  }
  if (exists) {
    throw new Error('Key / path already exists');
  }
  // set to original config map
  this._origConf.set(path, selfObj);
  // set to own map
  ss.Config.superClass_.set.call(this, path, selfObj);

};

/**
 * Override the StringPath method and do validations:
 * Current validations include:
 * - Type checking. If the set value is of same type as the one set
 *      via this method.
 * - Overwrite checking. We cannot overwrite keys / path
 * - No objects allowed. Objects are not allowed as value
 *
 * @override
 * @throws Errors depending on validation checks
 */
ss.Config.prototype.set = function(key, value)
{
  // check if value is object
  if (goog.isObject(value)) {
    throw new TypeError('Object type for value not allowed');
  }
  
  // get the value from original config with the throw ReferenceError 
  // parameter set to true
  // if the key doesn't exist do not do a type check
  var val;
  var exists = true;
  try {
    val = this._origConf.get(key, true);
  } catch(e) {
    exists = false;
  }
  
  if (exists && goog.typeOf(value) != goog.typeOf(val)) {
    throw new TypeError('Expected:' + goog.typeOf(val) + ' got:' + goog.typeOf(value));
  }
  // call our parent set method
  ss.Config.superClass_.set.call(this, key, value);
};

/**
 * Don't support remove
 * @override
 * @throws Error always
 */
ss.Config.prototype.remove = function()
{
  throw new Error(ss.Config.Error.methodRemoved);
};

/**
 * Don't support addRaw
 * @override
 * @throws Error always
 */
ss.Config.prototype.addRaw = function()
{
  throw new Error(ss.Config.Error.methodRemoved);
};





