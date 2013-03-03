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
goog.provide('ssd.structs.StringPath');
goog.provide('ssd.structs.StringPath.Errors');

/**
 * The constructor
 * @param {Object|ssd.structs.StringPath=} optObj Initial data to load
 * @constructor
 */
ssd.structs.StringPath = function(optObj)
{
  /**
   * @type {Object} Underlying JS object used to implement the map.
   * @private
   */
  this._data = {};

  if (optObj) {
    this.addRaw(optObj);
  }
};

/** @type {string} The dot. */
ssd.structs.StringPath.DOT = '.';

/**
 * Add raw data, either an object hash or an instance of ssd.structs.StringPath
 * NOTE: Overwrites any existing data
 * @param {Object|ssd.structs.StringPath}
 */
ssd.structs.StringPath.prototype.addRaw = function(obj)
{
  if (obj instanceof ssd.structs.StringPath) {
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
ssd.structs.StringPath.prototype.toObject = function() {
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
ssd.structs.StringPath.prototype.set = function(key, value) {
  // some plain validations
  if('string' !== typeof key) {
      throw new TypeError();
  }
  this._resolvePath(key.split(ssd.structs.StringPath.DOT), this._data, {isSet:true}, value);
};

/**
 * Get a stored value.
 *
 * Treat storage as you would a typical JS Object / hash, e.g.
 * 'guest.location.city' would return the city value
 * 'guest' would return the full guest object
 *
 * @param {string} key
 * @param {boolean=} optThrowError optionally throw a ReferenceError if key not found
 * @return {*} null if value not found
 * @throws {TypeError} if key not string
 */
ssd.structs.StringPath.prototype.get = function(key, optThrowError) {
  if('string' !== typeof key) {
    throw new TypeError();
  }
  return this._resolvePath(key.split(ssd.structs.StringPath.DOT), this._data, {isGet:true}, null, optThrowError);
};

/**
 * A cascading type of getting. e.g. getting:
 * path.to.the.key, all paths will be cheked down to root 'key':
 * path.to.key
 * path.key
 * key
 *
 * @param  {[type]} keyPath       [description]
 * @param {boolean=} optThrowError optionally throw a ReferenceError if key not found
 * !param {string} key
 * @return {*} null if value not found
 * @throws {TypeError} if key not string
 */
ssd.structs.StringPath.prototype.getCascading = function( keyPath, optThrowError) {
  var parts = keyPath.split( ssd.structs.StringPath.DOT );

  if ( 1 === parts.length ) {
    return this.get( keyPath, optThrowError );
  }

  var key = parts.pop();
  var currentKey;
  do {
    currentKey = parts.join( ssd.structs.StringPath.DOT ) +
      ssd.structs.StringPath.DOT + key;

    /** @preserveTry */
    try {
      return this.get( currentKey, true);
    } catch( ex ) {
      // nothing todo, next loop
    }
  } while(parts.pop());

  return this.get( key, optThrowError );
};

/**
 * Remove (delete) a key from the storage
 *
 * @param {string} key
 * @return {void}
 */
ssd.structs.StringPath.prototype.remove = function(key) {
    this._resolvePath(key.split(ssd.structs.StringPath.DOT), this._data, {isDel:true});
};

/**
 * Whether we contain the given key or not
 * @param  {string} key The key we want to check if it exists.
 * @return {boolean} If the key exists or not.
 */
ssd.structs.StringPath.prototype.containsKey = function(key)
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
 * @param {Object.<boolean>} op An object containing a boolean true value for one of
 *          they following keys / operations:
 *          isSet if we want to SET a variable
 *          isGet if we want to GET a variable
 *          isDel if we want to DELETE a variable
 * @param {*=} optVal If we want to set, include here the value
 * @param {boolean=} optThrowError optionally throw a ReferenceError if key not found
 *      Only valid for isGet and isDel mode
 * @return {*} The value we resolved
 */
ssd.structs.StringPath.prototype._resolvePath = function(parts, obj, op, optVal, optThrowError) {
    var part = parts.shift();
    // check if we are in the last part of our path
    if (0 === parts.length) {
        if (op.isSet) {
            // force overwrite
            obj[part] = optVal;
            return;
        }
        if (op.isDel) {
            delete obj[part];
        } else {
            if (!goog.isDef(obj[part]) && optThrowError) {
              throw new ReferenceError();
            } else {
              return obj[part];
            }
        }
    }

    if (!goog.isDef(obj[part])) {
        if (op.isSet) {
            obj[part] = {};
        } else {
          if (optThrowError) {
            throw new ReferenceError();
          } else {
            return null;
          }
        }
    } else if (op.isSet && 'object' !== goog.typeOf(obj[part])) {
        // This is the case where we want to SET a value
        // in a path and somewhere along the path we don't find an
        // object. In this case we have to overwrite whatever was
        // previously set as this is the described functionality
        obj[part] = {};
    }
    return this._resolvePath(parts, obj[part], op, optVal, optThrowError);
};
