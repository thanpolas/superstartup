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
 * created on Jun 10, 2012
 */
 
 /**
  * @fileoverview A plain storage facility with string to path resolving
  */
goog.provide('ss.StringPath');
goog.provide('ss.StringPath.Errors');

/**
 * The constructor
 * @param {Object|ss.StringPath=} opt_obj Initial data to load
 * @constructor
 */
ss.StringPath = function(opt_obj)
{
  /**
   * @type {Object} Underlying JS object used to implement the map.
   * @private
   */
  this._data = {};
  /**
   * @type {string} The .dot, save us few bytes...
   * @private
   */
  this._dot = '.';
  
  if (opt_obj) {
    this.addRaw(opt_obj);
  }
};

/**
 * Errors thrown by this class
 * @enum {string}
 */
ss.StringPath.Errors = {
  WRONGTYPE: 'Wrong type passed'
};

/**
 * Add raw data, either an object hash or an instance of ss.StringPath
 * NOTE: Overwrites any existing data
 * @param {Object|ss.StringPath}
 */
ss.StringPath.prototype.addRaw = function(obj)
{
  if (obj instanceof ss.StringPath) {
    this._data = obj.getRaw();
  } else if (goog.isObject(obj)){
    this._data = obj;
  } else {
    throw new Error(ss.StringPath.Errors.WRONGTYPE);
  }
};

/**
 * Return the stored data object in raw format
 * (Native JS Object)
 * @return {Object}
 */
ss.StringPath.prototype.getRaw = function()
{
  return this._data;
};

/**
 * Set a value to the key specified.
 *
 * We blindly overwrite any previous values
 *
 * Input keys as if you are refering to object paths separated with dots
 * e.g.: 'guest.location.city'
 *
 * @param {string} key The key to save the value for
 * @param {*} value the value we want to store. Can be anything
 * @return {void}
 */
ss.StringPath.prototype.set = function(key, value) {
  // some plain validations
  if('string' != typeof key) {
      throw new Error(ss.StringPath.Errors.WRONGTYPE);
  }
  this._resolvePath(key.split(this._dot), this._data, {isSet:true}, value);
};

/**
 * Get a stored value.
 *
 * Treat storage as you would a typical JS Object / hash, e.g.
 * 'guest.location.city' would return the city value
 * 'guest' would return the full guest object
 *
 * @param {string} key
 * @return {*} null if value not found
 */
ss.StringPath.prototype.get = function(key) 
{
  if('string' != typeof key) {
    throw new Error(ss.StringPath.Errors.WRONGTYPE);
  }
  return this._resolvePath(key.split(this._dot), this._data, {isGet:true});
};

/**
 * Remove (delete) a key from the storage
 *
 * @param {string} key
 * @return {void}
 */
ss.StringPath.prototype.remove = function(key) {
    this._resolvePath(key.split(this._dot), this._data, {isDel:true});
};

/**
 * Resolve the path to set/get on our data object
 * based on the given string.
 *
 * If we want to set the value, then if the path does not exist
 * we will create it as we dive in the object recursively.
 *
 * If we want to get the value and the path does not exist we will
 * return null
 *
 * @private
 * @param {array} parts Our path split into an array ['a','b','c'] --> a.b.c
 * @param {Object} obj The object we will dive into
 * @param {Object} An object containing a boolean true value for one of
 *          they following keys / operations:
 *          isSet if we want to SET a variable
 *          isGet if we want to GET a variable
 *          isDel if we want to DELETE a variable
 * @param {*=} opt_val If we want to set, include here the value
 * @return {*} The value we resolved
 */
ss.StringPath.prototype._resolvePath = function(parts, obj, op, opt_val) {
    var len = parts.length;
    var part = parts.shift();
    // check if we are in the last part of our path
    if (1 == len) {
        if (op.isSet) {
            // force overwrite
            obj[part] = opt_val;
            return;
        }
        if (op.isDel) {
            delete obj[part];
        } else {
            return obj[part];
        }
    }
    if (obj[part] == null) {
        if (op.isSet) {
            obj[part] = {};
        } else {
            return null;
        }
    } else if (op.isSet && 'object' != goog.typeOf(obj[part])) {
        // This is the case where we want to SET a value
        // in a path and somewhere along the path we don't find an
        // object. In this case we have to overwrite whatever was
        // previously set as this is the described functionality
        obj[part] = {};
    }
    return this._resolvePath(parts, obj[part], op, opt_val);
};
