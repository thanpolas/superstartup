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
goog.require('ssd.events.EventTarget');
goog.require('goog.object');

/**
 * Class for Hash Map datastructure.
 * @param {*=} opt_map Map or Object to initialize the map with.
 * @param {...*} var_args If 2 or more arguments are present then they
 *     will be used as key-value pairs.
 * @constructor
 * @extends {ssd.Map, ssd.events.EventTarget}
 * We also inherit from ssd.events.EventTarget
 */
ssd.DynamicMap = function(opt_map, var_args) {
  /**
   * In cases of mass data insertions turn off event dispatching
   * @private
   * @type {boolean}
   */
  this._canDispatch = true;

  ssd.events.EventTarget.call(this);
  goog.structs.Map.apply(this, arguments);

};
goog.inherits(ssd.DynamicMap, goog.structs.Map);
goog.object.extend(ssd.DynamicMap.prototype, ssd.events.EventTarget.prototype);

/**
 * Events triggered by the Dynamic Map
 * @enum {string}
 */
ssd.DynamicMap.EventType = {
  // When a plain change happens on a property
  BEFORE_SET: 'beforeSet',
  AFTER_SET:  'afterSet',
  BEFORE_ADDALL: 'beforeAddall',
  AFTER_ADDALL: 'afterAddall'
};

/**
 * Define the event path we'll prepend to all events
 * that this class will emit.
 *
 * @param {string} path The event path we want to prepend
 * @return {void}
 */
ssd.DynamicMap.prototype.setEventPath = function(path)
{
  this._eventPath = path;
};

/**
 * Will return the exact event type that will be emitted
 * based on the eventPath that was set and the eventType that
 * was provided
 *
 * @param  {ssd.DynamicMap.EventType} eventType The eventType
 *                                              we want to listen
 *                                              or trigger.
 * @return {string} The evenType  along with the full path.
 */
ssd.DynamicMap.prototype.getEventType = function(eventType)
{
  return this._eventPath + eventType;
};


/**
 * Adds a key-value pair to the map. Triggers a plain change event
 * or a change with persinstent save event
 * @param {*} key The key.
 * @param {*} value The value to add.
 */
ssd.DynamicMap.prototype.set = function(key, value)
{
  var eventObj;
  if (this._canDispatch) {
    eventObj = {
      'type': ssd.DynamicMap.EventType.BEFORE_SET,
      'key': key,
      'value': value
    };
    // Trigger and check if preventDefault was called
    if (!this.dispatchEvent(eventObj)){
      return;
    }
  }

  // perform the set
  ssd.DynamicMap.superClass_.set.call(this, key, value);

  // dispatch corresponding event
  if (this._canDispatch) {
    eventObj['type'] = ssd.DynamicMap.EventType.AFTER_SET;
    this.dispatchEvent(eventObj);
  }
};

/** @inheritDoc */
ssd.DynamicMap.prototype.addAll = function(map)
{

  var eventObj = {
    'type': ssd.DynamicMap.EventType.BEFORE_ADDALL,
    'map': map
  };
  // Trigger and check if preventDefault was called
  if (!this.dispatchEvent(eventObj)){
    return;
  }

  // payload
  this._canDispatch = false;
  ssd.DynamicMap.superClass_.addAll.call(this, map);
  this._canDispatch = true;

  eventObj['type'] = ssd.DynamicMap.EventType.AFTER_ADDALL;
  this.dispatchEvent(eventObj);

};

