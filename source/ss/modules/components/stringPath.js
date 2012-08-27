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
goog.provide('ssd.StringPath');
goog.provide('ssd.StringPath.Errors');

/**
 * The constructor
 * @param {Object|ssd.StringPath=} opt_obj Initial data to load
 * @constructor
 */
ssd.StringPath = function(opt_obj)
{
  /**
   * @type {Object} Underlying JS object used to implement the map.
   * @private
   */
  this._data = {};

  if (opt_obj) {
    this.addRaw(opt_obj);
  }
};

/** @type {string} The dot. */
ssd.StringPath.DOT = '.';

/**
 * Add raw data, either an object hash or an instance of ssd.StringPath
 * NOTE: Overwrites any existing data
 * @param {Object|ssd.StringPath}
 */
ssd.StringPath.prototype.addRaw = function(obj)
{
  if (obj instanceof ssd.StringPath) {
    this._data = obj.toObject();
  } else if (goog.isObject(obj)){
    this._data = obj;
  } else {
    throw new TypeError();
  }
};

/**
 * Return the stored data object in raw format
 * (Native JS Object)
 * @return {Object}
 */
ssd.StringPath.prototype.toObject = function()
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
ssd.StringPath.prototype.set = function(key, value) {
  // some plain validations
  if('string' != typeof key) {
      throw new TypeError();
  }
  this._resolvePath(key.split(ssd.StringPath.DOT), this._data, {isSet:true}, value);
};

/**
 * Get a stored value.
 *
 * Treat storage as you would a typical JS Object / hash, e.g.
 * 'guest.location.city' would return the city value
 * 'guest' would return the full guest object
 *
 * @param {string} key
 * @param {boolean=} opt_throwError optionally throw a ReferenceError if key not found
 * @return {*} null if value not found
 * @throws {TypeError} if key not string
 */
ssd.StringPath.prototype.get = function(key, opt_throwError)
{
  if('string' != typeof key) {
    throw new TypeError();
  }
  return this._resolvePath(key.split(ssd.StringPath.DOT), this._data, {isGet:true}, null, opt_throwError);
};

/**
 * Remove (delete) a key from the storage
 *
 * @param {string} key
 * @return {void}
 */
ssd.StringPath.prototype.remove = function(key) {
    this._resolvePath(key.split(ssd.StringPath.DOT), this._data, {isDel:true});
};

/**
 * Whether we contain the given key or not
 * @param  {string} key The key we want to check if it exists.
 * @return {boolean} If the key exists or not.
 */
ssd.StringPath.prototype.containsKey = function(key)
{
  try {
    this.get(key, true);
    return true;
  } catch(e) {
    return false;
  }
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
 * @param {Object.<boolean>} An object containing a boolean true value for one of
 *          they following keys / operations:
 *          isSet if we want to SET a variable
 *          isGet if we want to GET a variable
 *          isDel if we want to DELETE a variable
 * @param {*=} opt_val If we want to set, include here the value
 * @param {boolean=} opt_throwError optionally throw a ReferenceError if key not found
 *      Only valid for isGet and isDel mode
 * @return {*} The value we resolved
 */
ssd.StringPath.prototype._resolvePath = function(parts, obj, op, opt_val, opt_throwError)
{
    var part = parts.shift();
    // check if we are in the last part of our path
    if (0 === parts.length) {
        if (op.isSet) {
            // force overwrite
            obj[part] = opt_val;
            return;
        }
        if (op.isDel) {
            delete obj[part];
        } else {
            if (!goog.isDef(obj[part]) && opt_throwError) {
              throw new ReferenceError();
            } else {
              return obj[part];
            }
        }
    }

    if (obj[part] === null) {
        if (op.isSet) {
            obj[part] = {};
        } else {
          if (opt_throwError) {
            throw new ReferenceError();
          } else {
            return null;
          }
        }
    } else if (op.isSet && 'object' != goog.typeOf(obj[part])) {
        // This is the case where we want to SET a value
        // in a path and somewhere along the path we don't find an
        // object. In this case we have to overwrite whatever was
        // previously set as this is the described functionality
        obj[part] = {};
    }
    return this._resolvePath(parts, obj[part], op, opt_val, opt_throwError);
};
