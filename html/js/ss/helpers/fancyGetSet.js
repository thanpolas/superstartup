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
 * createdate 16/Jun/2012
 */

 /**
  * @fileoverview A fancy get / set class
  */

goog.provide('ss.fancySetGet');

/**
 * The fancy Set Get constructor.
 * Returns the .setGet method which does the fancy Set/Get
 * @constructor
 * @param {!Object}
 */
ss.fancySetGet = function(object)
{
  /**
   * The object we are setting / getting
   * @private
   * @type {!Object}
   */
  this._obj = object;
  return this.setGet;
};
/**
 * Set or get config values. 
 * 
 * No parameters, we GET the whole object
 * First parameter a string with no second one, act as key, GET specified value
 * First parameter an object, we parse and SET key / value pairs 
 * First parameter a string, second a mixed, we SET as key / value 
 *
 * @param {string|Object=} opt_key
 * @param {*=} opt_value
 * @return {*}
 */
ss.fancySetGet.prototype.setGet = function(opt_key, opt_value)
{
  switch (goog.typeOf(opt_key)) {
    case 'object':
      for(var k in opt_key) {
        this._obj[k] = opt_key[k];
      }
    break;
    case 'string':
      if (1 < arguments.length) {
        this._obj[opt_key] = opt_value;
      } else {
        return this._obj[opt_key];
      }
    break;
    case 'undefined':
      return this._obj;
    break;
    default:
      throw new TypeError('Expecting a string, object or undefined');
    break;
  }
};