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
  * @fileoverview An extention of ssd.structs.Map class, along with goog.events
  *     Alerts us for every change in the data structure
  */

goog.provide('ssd.structs.DynamicMap');
goog.provide('ssd.structs.DynamicMap.EventType');
goog.provide('ssd.structs.DynamicMap.Operation');

goog.require('ssd.structs.Map');
goog.require('goog.events.EventTarget');
goog.require('goog.object');

/**
 * Class for Hash Map datastructure.
 * @param {*=} opt_map Map or Object to initialize the map with.
 * @param {...*} var_args If 2 or more arguments are present then they
 *     will be used as key-value pairs.
 * @constructor
 * @extends {ssd.structs.Map, goog.events.EventTarget}
 */
ssd.structs.DynamicMap = function(opt_map, var_args) {
  /**
   * In cases of mass data insertions turn off event dispatching
   * @private
   * @type {boolean}
   */
  this._canDispatch = true;

  /**
   * Do not trigger any Events
   * @type {boolean}
   * @protected
   */
  this._eventsMuted = false;

  /**
   * @type {string?} If a map id is specified for this dataset store it here.
   * @private
   */
  this._mapId = null;

  goog.events.EventTarget.call(this);
  ssd.structs.Map.apply(this, arguments);

};
goog.inherits(ssd.structs.DynamicMap, ssd.structs.Map);
goog.object.extend(ssd.structs.DynamicMap.prototype, goog.events.EventTarget.prototype);

/**
 * Events triggered by the Dynamic Map
 * @enum {string}
 */
ssd.structs.DynamicMap.EventType = {
  // When a plain change happens on a property
  BEFORE_SET   : 'dynamicMap.beforeSet',
  AFTER_SET    : 'dynamicMap.afterSet',
  BEFORE_ADDALL: 'dynamicMap.beforeAddall',
  AFTER_ADDALL : 'dynamicMap.afterAddall',
  BEFORE_REMOVE: 'dynamicMap.beforeRemove',
  AFTER_REMOVE : 'dynamicMap.afterRemove',

  // fires on every data change event, after the "AFTER_*" events
  DATA_CHANGED : 'dynamicMap.dataChanged'
};

/**
 * All the possible data mangling operations.
 * @enum {string}
 */
ssd.structs.DynamicMap.Operation = {
  SET     : 'dynamicMap.set',
  ADDALL  : 'dynamicMap.addAll',
  REMOVE  : 'dynamicMap.remove'
};

/**
 * trigger the data changed event.
 *
 * @param  {Object} eventObj The custom event object.
 * @param  {ssd.structs.DynamicMap.Operation} oper the operation type.
 * @private
 */
ssd.structs.DynamicMap.prototype._dispatchDataChanged = function(eventObj, oper) {
  var newEventObj = goog.object.clone(eventObj);
  newEventObj.operation = oper;
  newEventObj.type = ssd.structs.DynamicMap.EventType.DATA_CHANGED;
  this.dispatchEvent(newEventObj);
};



/**
 * Adds a key-value pair to the map. Triggers a plain change event
 * or a change with persinstent save event.
 *
 * @param {*} key The key.
 * @param {*} value The value to add.
 * @override
 */
ssd.structs.DynamicMap.prototype.set = function(key, value)
{
  /** @type {Object?} */
  var eventObj;
  if (this._canDispatch && !this._eventsMuted) {
    eventObj = {
      type: ssd.structs.DynamicMap.EventType.BEFORE_SET,
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
  ssd.structs.DynamicMap.superClass_.set.call(this, key, value);

  // dispatch corresponding event
  if (this._canDispatch && !this._eventsMuted) {
    eventObj.type = ssd.structs.DynamicMap.EventType.AFTER_SET;
    this.dispatchEvent(eventObj);

    // trigger the data changed event
    this._dispatchDataChanged(eventObj, ssd.structs.DynamicMap.Operation.SET);
  }
};

/** @override */
ssd.structs.DynamicMap.prototype.addAll = function(map)
{
  /** @type {Object?} */
  var eventObj;

  if (!this._eventsMuted) {
    eventObj = {
      type: ssd.structs.DynamicMap.EventType.BEFORE_ADDALL,
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
  ssd.structs.DynamicMap.superClass_.addAll.call(this, map);
  this._canDispatch = true;

  if (!this._eventsMuted) {
    eventObj.type = ssd.structs.DynamicMap.EventType.AFTER_ADDALL;
    this.dispatchEvent(eventObj);

    // trigger the data changed event
    this._dispatchDataChanged(eventObj, ssd.structs.DynamicMap.Operation.ADDALL);
  }
};

/** @override */
ssd.structs.DynamicMap.prototype.remove = function(key)
{
  /** @type {Object?} */
  var eventObj;

  if (!this._eventsMuted) {
    eventObj = {
      type: ssd.structs.DynamicMap.EventType.BEFORE_REMOVE,
      'key': key,
      'mapId': this._mapId
    };
    // Trigger and check if preventDefault was called
    if (!this.dispatchEvent(eventObj)){
      return false;
    }
  }

  var response = ssd.structs.DynamicMap.superClass_.remove.call(this, key);

  if (!this._eventsMuted) {
    eventObj.type = ssd.structs.DynamicMap.EventType.AFTER_REMOVE;
    eventObj['response'] = response;
    this.dispatchEvent(eventObj);
    // trigger the data changed event
    this._dispatchDataChanged(eventObj, ssd.structs.DynamicMap.Operation.REMOVE);
  }
  return response;
};

/**
 * Do not trigger any events for any operation.
 *
 * Use when doing bulk set / del operations
 *
 */
ssd.structs.DynamicMap.prototype.stopEvents = function()
{
  this._eventsMuted = true;
};

/**
 * start emitting events again, invoke after a .stopEvents()
 *
 */
ssd.structs.DynamicMap.prototype.startEvents = function()
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
ssd.structs.DynamicMap.prototype.setMapId = function(mapId)
{
  this._mapId = mapId;
};

/**
 * Get the name of this dataset
 *
 * @return {string|null} The name if set or null.
 */
ssd.structs.DynamicMap.prototype.getMapId = function()
{
  return this._mapId;
};


/** @inheritDoc */
ssd.structs.DynamicMap.prototype.disposeInternal = function() {
  // (1) Call the superclass's disposeInternal() method.
  ssd.structs.map.disposeInternal.call(this);
  goog.events.EventTarget.disposeInternal.call(this);
};
