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
  * @fileoverview An extention of goog.structs.Map class, adding the .forEach method
  */

goog.provide('ssd.Map');

goog.require('goog.structs.Map');

/**
 * Class for Hash Map datastructure.
 * @param {*=} opt_map Map or Object to initialize the map with.
 * @param {...*} var_args If 2 or more arguments are present then they
 *     will be used as key-value pairs.
 * @constructor
 * @extends {goog.structs.Map}
 */
ssd.Map = function(opt_map, var_args) {
  goog.structs.Map.apply(this, arguments);

  /**
   * Indicates if this map contains values which were added with
   * the {@see ssd.Map.storeWithId} method.
   *
   * @type {boolean}
   * @private
   */
  this._hasIdValues = false;

  /**
   * If we have values stored with ID, this is the increment
   * that holds the next id to be used.
   * @type {number}
   * @private
   */
  this._increment = 1;
};
goog.inherits(ssd.Map, goog.structs.Map);

/**
 * When storing values with unique id we prefix the
 * increment with this value so all ids are stored
 * as string.
 * @const {string}
 */
ssd.Map.INCREMENT_PREFIX = 'i';

/**
 * Use this name for the id key when we get values
 * including the id {@see ssd.Map.getValuesWithId}.
 * @const {string}
 */
ssd.Map.ID_NAME = '__id__';

/**
 * When giving values including the id and the values
 * are not of type Object, then we store than value
 * in a newly created object under the key name defined
 * in this const {@see ssd.Map.getValuesWithId}.
 *
 * @const {string}
 */
ssd.Map.VALUE_NAME = 'value';

/**
 * Safely iterate over the Map's key-value pairs
 * DO NOT CHANGE THE MAP WHILE ITERATING
 *
 * @param {Function(string, *): boolean} fn Callback fn with key, value parameters and
 *    boolean TRUE return value to stop iteration
 * @param {Object=} opt_selfObj optionally set the context to execute the func
 * @return {void}
 */
ssd.Map.prototype.forEach = function(fn, opt_selfObj)
{
  var keys = this.getKeys();
  var map = this.map_;
  var selfObj = opt_selfObj || goog.global;
  for(var i = 0, l = keys.length; i < l; i++) {
    if (true === fn.call(selfObj, keys[i], map[keys[i]])) {
      return;
    }
  }
};

/**
 * Store any data in the map with a unique id as key.
 *
 * Key will plainly be a numeric increment starting from 1.
 *
 * @param  {!Array} data Any set of data
 * @return {void}
 */
ssd.Map.prototype.storeWithId = function(data) {
  for(var i = 0, l = data.length; i < l; i++) {
    this.set(ssd.Map.INCREMENT_PREFIX + this._increment, data[i]);
    this._increment++;
  }
};

/**
 * Return an array with the values including their id.
 *
 * The values are cast into Object type so they can include
 * the new id key, if they are already an object then the
 * id key is just added.
 *
 * If the values are not of type Object then they are stored
 * in the newly created object under the key 'value'
 * {@see ssd.Map.VALUE_NAME}
 *
 * The id key's name is stored in the const {@see ssd.Map.ID_NAME}
 *
 * @return {Array.<Object>} The values cast in Object to contain the id.
 */
ssd.Map.prototype.getValuesWithId = function() {
  var values = [];
  var newObj = {};
  this.forEach(function(key, value){
    if(goog.isObject(value)) {
      value[ssd.Map.ID_NAME] = key;
      values.push(value);
    } else {
      newObj = {};
      newObj[ssd.Map.ID_NAME] = key;
      newObj[ssd.Map.VALUE_NAME] = value;
      values.push(newObj);
    }
  }, this);

  return values;
};