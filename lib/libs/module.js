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

/**
 * After a module is initialized we want to get the altered config
 * back to our config container.
 *
 * This is what this method does.
 *
 * The reason we need this method is because it often is the case that
 * fetching the config via the module's path (e.g. 'user.auth') can also
 * fetch subkeys that represent configs of other modules that are under the
 * 'user.auth' namespace.
 *
 * So with this method we ensure that we only keep the config keys that belong
 * to this module
 *
 * @param {!Object} config The config as passed from the config instance.
 * @private
 */
ssd.Module.prototype._configApply = function(config)
{
  var moduleConfig = this.config.toObject();
  for (var key in moduleConfig) {
    // for every key found in this module's config
    // get the key from the incoming config object
    // and assign it back.
    //
    // Maybe in the future require that 'key' is defined
    // in the 'config' object passed, thus also performing a validation in this
    // method, or if it's not set avoid assignment of the 'undefined' object.
    // Let's wait and see where this takes us...
    this.config(key, config[key]);
  }

};
