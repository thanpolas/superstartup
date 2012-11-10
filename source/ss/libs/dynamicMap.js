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
goog.provide('ssd.DynamicMap.EventType');

goog.require('ssd.Map');
goog.require('goog.events.EventTarget');
goog.require('goog.object');

/**
 * Class for Hash Map datastructure.
 * @param {*=} opt_map Map or Object to initialize the map with.
 * @param {...*} var_args If 2 or more arguments are present then they
 *     will be used as key-value pairs.
 * @constructor
 * @extends {ssd.Map, goog.events.EventTarget}
 * We also inherit from goog.events.EventTarget
 */
ssd.DynamicMap = function(opt_map, var_args) {
  /**
   * In cases of mass data insertions turn off event dispatching
   * @private
   * @type {boolean}
   */
  this._canDispatch = true;

  /**
   * Do not trigger any Events
   * @type {boolean}
   * @private
   */
  this._eventsMuted = false;

  /**
   * @type {string?} If a map id is specified for this dataset store it here.
   * @private
   */
  this._mapId = null;

  goog.events.EventTarget.call(this);
  ssd.Map.apply(this, arguments);

};
goog.inherits(ssd.DynamicMap, ssd.Map);
goog.object.extend(ssd.DynamicMap.prototype, goog.events.EventTarget.prototype);

/**
 * Events triggered by the Dynamic Map
 * @enum {string}
 */
ssd.DynamicMap.EventType = {
  // When a plain change happens on a property
  BEFORE_SET   : 'dynamicMap.beforeSet',
  AFTER_SET    : 'dynamicMap.afterSet',
  BEFORE_ADDALL: 'dynamicMap.beforeAddall',
  AFTER_ADDALL : 'dynamicMap.afterAddall',
  BEFORE_REMOVE: 'dynamicMap.beforeRemove',
  AFTER_REMOVE : 'dynamicMap.afterRemove'
};


/**
 * Adds a key-value pair to the map. Triggers a plain change event
 * or a change with persinstent save event
 * @param {*} key The key.
 * @param {*} value The value to add.
 * @override
 */
ssd.DynamicMap.prototype.set = function(key, value)
{
  /** @type {Object?} */
  var eventObj;
  if (this._canDispatch && !this._eventsMuted) {
    eventObj = {
      type: ssd.DynamicMap.EventType.BEFORE_SET,
      'key': key,
      'value': value,
      'mapId': this._mapId
    };
    // Trigger and check if preventDefault was called
    if (!this.dispatchEvent(eventObj)){
      return;
    }
  }

  // perform the set
  ssd.DynamicMap.superClass_.set.call(this, key, value);

  // dispatch corresponding event
  if (this._canDispatch && !this._eventsMuted) {
    eventObj.type = ssd.DynamicMap.EventType.AFTER_SET;
    this.dispatchEvent(eventObj);
  }
};

/** @override */
ssd.DynamicMap.prototype.addAll = function(map)
{
  /** @type {Object?} */
  var eventObj;

  if (!this._eventsMuted) {
    eventObj = {
      type: ssd.DynamicMap.EventType.BEFORE_ADDALL,
      'map': map,
      'mapId': this._mapId
    };
    // Trigger and check if preventDefault was called
    if (!this.dispatchEvent(eventObj)){
      return;
    }
  }

  // payload
  this._canDispatch = false;
  ssd.DynamicMap.superClass_.addAll.call(this, map);
  this._canDispatch = true;

  if (!this._eventsMuted) {
    eventObj.type = ssd.DynamicMap.EventType.AFTER_ADDALL;
    this.dispatchEvent(eventObj);
  }
};

/** @override */
ssd.DynamicMap.prototype.remove = function(key)
{
  /** @type {Object?} */
  var eventObj;

  if (!this._eventsMuted) {
    eventObj = {
      type: ssd.DynamicMap.EventType.BEFORE_REMOVE,
      'key': key,
      'mapId': this._mapId
    };
    // Trigger and check if preventDefault was called
    if (!this.dispatchEvent(eventObj)){
      return false;
    }
  }

  var response = ssd.DynamicMap.superClass_.remove.call(this, key);

  if (!this._eventsMuted) {
    eventObj.type = ssd.DynamicMap.EventType.AFTER_REMOVE;
    eventObj['response'] = response;
    this.dispatchEvent(eventObj);
  }
  return response;
};

/**
 * Do not trigger any events for any operation.
 *
 * Use when doing bulk set / del operations
 *
 */
ssd.DynamicMap.prototype.startEventMute = function()
{
  this._eventsMuted = true;
};

/**
 * Ends the trigger mute, from now on events will be triggered.
 *
 */
ssd.DynamicMap.prototype.endEventMute = function()
{
  this._eventsMuted = false;
};

/**
 * Set a map id for this dataset. The name is a unique identifier
 * for this dataset, it's optional and if set will get transmitted
 * in every dispatched event.
 *
 * Use when having multiple dynamicMaps propagating events through
 * the same parent class.
 *
 * @param {string} mapId A unique identifier for this dataset.
 */
ssd.DynamicMap.prototype.setMapId = function(mapId)
{
  this._mapId = mapId;
};

/**
 * Get the name of this dataset
 *
 * @return {string|null} The name if set or null.
 */
ssd.DynamicMap.prototype.getMapId = function()
{
  return this._mapId;
};
