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
  
  this._origConf.set(path, selfObj);
  this.set(path, selfObj);
};

/**
 * Override the StringPath method and do validations:
 * Current validations include:
 * - Type checking. If the set value is of same type as the one set
 *      via this method.
 * - Defined checking. If the set key was defined via this method first.
 *
 * @inheritdoc
 */
ss.Config.prototype.set = function(key, value)
{
  // get the value with throw ReferenceError parameter set to true
  // if the key doesn't exist an error will be thrown
  var val = this._origConf.get(key, true);

  if (goog.typeOf(value) != goog.typeOf(val)) {
    throw new TypeError();
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





