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
 * createdate 10/Jun/2012
 */

 /**
  * @fileoverview An extention of ssd.Map class, along with goog.events
  *     Alerts us for every change in the data structure
  */

goog.provide('ssd.DynamicMap');

goog.require('ssd.Map');
goog.require('goog.events.EventTarget');
goog.require('goog.object');

/**
 * Class for Hash Map datastructure.
 * @param {*=} opt_map Map or Object to initialize the map with.
 * @param {...*} var_args If 2 or more arguments are present then they
 *     will be used as key-value pairs.
 * @constructor
 * @extends {ssd.Map}
 * We also inherit from goog.events.EventTarget
 */
ssd.DynamicMap = function(opt_map, var_args) {
  /**
   * In cases of mass data insertions turn off event dispatching
   * @private
   * @type {boolean}
   */
  this._canDispatch = false;
  
  goog.structs.Map.apply(this, arguments);
  goog.events.EventTarget.call(this);
  this._canDispatch = true;
};
goog.inherits(ssd.DynamicMap, goog.structs.Map);
goog.object.extend(ssd.DynamicMap.prototype, goog.events.EventTarget.prototype);

/**
 * Events triggered by the Dynamic Map
 * @enum {string}
 */
ssd.DynamicMap.EventType = {
  // When a plain change happens on a property
  CHANGE: 'change',
  // When a change happens on a property with a request to save
  CHANGESAVE: 'changeSave'
};


/**
 * Adds a key-value pair to the map. Triggers a plain change event
 * or a change with persinstent save event
 * @param {*} key The key.
 * @param {*} value The value to add.
 * @param {boolean=} opt_save If we want the change to be saved
 */
ssd.DynamicMap.prototype.set = function(key, value, opt_save)
{
  ssd.DynamicMap.superClass_.set.call(this, key, value);
  // dispatch corresponding event
  this._canDispatch && this.dispatchEvent(opt_save && ssd.DynamicMap.EventType.CHANGESAVE || ssd.DynamicMap.EventType.CHANGE);  
};

/** @inheritDoc */
ssd.DynamicMap.prototype.addAll = function(map)
{
  this._canDispatch = false;
  ssd.DynamicMap.superClass_.addAll.call(this, map);
  this._canDispatch = true;
};

/**
 * Implement the save logic for this data object.
 * Should submit the data object for saving to the server
 */
ssd.DynamicMap.prototype.save = goog.abstractMethod;
