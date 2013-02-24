/**
* @fileoverview A fancy get / set class
*/
goog.provide('ssd.structs.FancyGetSet');

goog.require('ssd.invocator');

/**
 * The fancy Get Set constructor.
 * Returns the .getSet method which does the fancy Get/Set
 * @constructor
 * @param {Object=} optObject Give an object or use a new one.
 * @return {function(string=, *=)} returns the getSet method
 *                            along with all other methods.
 */
ssd.structs.FancyGetSet = function(optObject) {
  /**
   * The object we are setting / getting
   * @private
   * @type {!Object}
   */
  this._obj = optObject || {};

  return ssd.invocator.encapsulate( this, this.getSet );

};

/**
 * Set or get config values.
 *
 * No parameters, we GET the whole object
 * First parameter a string with no second one, act as key, GET specified value
 * First parameter an object, we parse and SET key / value pairs
 * First parameter a string, second a mixed, we SET as key / value
 *
 * @param {string|Object=} optKey
 * @param {*=} optValue
 * @return {*}
 * @throws {TypeError} if parameters of not valid type
 */
ssd.structs.FancyGetSet.prototype.getSet = function(optKey, optValue) {
  switch ( goog.typeOf( optKey ) ) {
    case 'object':
      for(var k in optKey) {
        this.set( k, optKey[k] );
      }
    break;
    case 'string':
      if (1 < arguments.length) {
        this.set( optKey, optValue );
      } else {
        return this.get( optKey );
      }
    break;
    case 'undefined':
      return this.toObject();
    break;
    default:
      throw new TypeError('Expecting a string, object or undefined');
    break;
  }
};

/**
 * Set a value.
 * @param {string} key The key.
 * @param {*} value the value.
 */
ssd.structs.FancyGetSet.prototype.set = function( key, value ) {
  this._obj[key] = value;
};


/**
 * Get a value.
 * @param {string} key The key.
 * @return {*} value the value.
 */
ssd.structs.FancyGetSet.prototype.get = function( key ) {
  return this._obj[key];
};

/**
 * Return the raw object literal.
 * @return {Object} The raw object literal.
 */
ssd.structs.FancyGetSet.prototype.toObject = function() {
  return this._obj;
};

/**
 * Determines if the provided key exists in our
 * object
 * @param  {string} key The key we want to test
 * @return {boolean} If the key exists in our object
 */
ssd.structs.FancyGetSet.prototype.containsKey = function(key)
{
  return key in this._obj;
};

/**
 * Return the object representation of the instance
 *
 * @return {!Object} The stored object.
 */
ssd.structs.FancyGetSet.prototype.toObject = function()
{
  return this._obj;
};

