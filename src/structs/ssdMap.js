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

goog.provide('ssd.structs.Map');

goog.require('goog.structs.Map');
goog.require('ssd.structs.IdGenerator');
goog.require('goog.object');
goog.require('goog.Disposable');

/**
 * Class for Hash Map datastructure.
 * @param {*=} opt_map Map or Object to initialize the map with.
 * @param {...*} var_args If 2 or more arguments are present then they
 *     will be used as key-value pairs.
 * @constructor
 * @extends {goog.structs.Map, ssd.structs.IdGenerator, goog.Disposable}
 */
ssd.structs.Map = function(opt_map, var_args) {

  goog.structs.Map.apply(this, arguments);
  ssd.structs.IdGenerator.call(this);
  goog.Disposable.call(this);


};
goog.inherits(ssd.structs.Map, goog.structs.Map);
goog.object.extend(ssd.structs.Map.prototype, ssd.structs.IdGenerator.prototype);
goog.object.extend(ssd.structs.Map.prototype, goog.Disposable);

/**
 * Safely iterate over the Map's key-value pairs
 * DO NOT CHANGE THE MAP WHILE ITERATING
 *
 * @param {Function(string, *): boolean} fn Callback fn with key, value parameters and
 *    boolean TRUE return value to stop iteration
 * @param {Object=} opt_selfObj optionally set the context to execute the func
 * @return {void}
 */
ssd.structs.Map.prototype.forEach = function(fn, opt_selfObj)
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

/** @inheritDoc */
ssd.structs.Map.prototype.disposeInternal = function() {
  this.clear();

};