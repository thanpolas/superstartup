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
goog.require('goog.object');


/**
 * A generic config setter / getter
 *
 * @param {Object|ss.StringPath=} opt_obj Initial data to load
 * @constructor
 * @extends {ss.StringPath}
 */
ss.Config = function(opt_obj)
{
  /**
   * The default config file, against which we will validate
   * @private
   * @type {Object}
   */
  this._defConf = {};

  /**
   * @private
   * @type {boolean} Switch to lock setting default confing
   */
  this._defConfSet = false;

  goog.base(this);

  // see if we have a default config passed, and run it
  if (opt_obj) {
    this.setDefault(opt_obj);
  }
};
goog.inherits(ss.Config, ss.StringPath);
goog.addSingletonGetter(ss.Config);

/**
 * @private
 * @type {string?} Stores current key we are validating
 */
ss.Config.prototype._validateKey = '';

/**
 * Sets the default config hash which will be used to compare
 * and validate the resulting config.
 * This method can only be run once!
 *
 * @param {Object|ss.StringPath} conf
 * @return {void}
 */
ss.Config.prototype.setDefault = function(conf)
{
  if (this._defConfSet) {
    throw new Error('Default config already set');
  }
  this._defConfSet = true;

  // check if StringPath instance
  if (conf instanceof ss.StringPath) {
    this._defConf = conf.toObject();
  } else {
    // clone copy the object
    this._defConf = goog.object.unsafeClone(conf);
  }

  // add to StringPath
  this.addRaw(conf);
};

/**
 * Validates the config contained in the StrinPath
 * compared to the one stored in this._defConf.
 *
 * Validation checks include:
 *    - All keys of _defConf are contained in StringPath
 *
 * @return {boolean}
 */
ss.Config.prototype.validate = function()
{
  return this._validateKeysRecurse(this._defConf, this.toObject());
};

/**
 * Performs the recursive keys validation.
 * Deep checks that all objects contain [at least]
 * the same properties as the default config
 * @private
 * @param {!Object} defConf
 * @param {Object} newConf
 * @return {boolean}
 */
ss.Config.prototype._validateKeysRecurse = function(defConf, newConf)
{
  if ('object' != goog.typeOf(newConf)) {
    return false;
  }
  for (var key in defConf) {
    if (!(key in newConf)) {
      this._validateKey = key;
      return false;
    }

    if ('object' == goog.typeOf(defConf[key])) {
      if (!this._validateKeysRecurse(defConf[key], newConf[key])) {
        this._validateKey = key;
        return false;
      }
    }
  }
  return true;
};

/**
 * If validation failed, this method returns the key we failed to
 * validate
 * @return {string}
 */
ss.Config.prototype.getInvalidKey = function()
{
  return this._validateKey;
};