

goog.provide('ssd.invocator');


/**
 * The invocator function creates a new instance of the provided constructor
 * which is also linked to a method that it contains.
 *
 * Check this fiddle for a live example: http://jsfiddle.net/thanpolas/Aky9Y/7/
 *
 * Invocator only works for pseudo-classical type of classes (prototypical).
 *
 * Requires 'bind' and 'isFunction', currently use underscore's equivalents.
 *
 * A special property '_instance' is exposed in the returned function which references
 * the new instance of the object (class) - so you can use it for 'instanceOf' comparisons
 *
 * Consider this use case:
 *
 * var classOne = function(){};
 * classOne.prototype.foo = function(){return 1;}; // a method of classOne
 * classOne.prototype.bar = function(){return 2;}; // another method of classOne
 *
 * var instOne = invocator(classOne, 'foo');
 *
 * // instOne() === instOne.foo();
 * // instOne.bar() === 2;
 *
 * @param {Function} parentCtor The constructor we will be invocating
 * @param {string} methodName The target method name we want to apply on
 *                             the created instance
 * @param {Regex=} opt_prvRegex A regex that matches the methods and properties
 *                              that are private, e.g. classOne.prototype._prv
 * @return {Function} An instance of parentCtor, that when invoked executes the
 *                    target method, and with all the public properties / methods
 *                    exposed.
 */
ssd.invocator = function(parentCtor, methodName, opt_prvRegex)
{

  // if regex not defined, default is to match every
  // string that is _ or starts with _ or ends with _
  var prvRegex = opt_prvRegex || /^(_|_.+|.+_)$/;

  var selfObj = new parentCtor();

  if (!goog.isFunction(selfObj[methodName])) {
    throw new TypeError('methodName:' + methodName + ' is not of type Function');
  }

  // create the capsule and assign the target method binded
  // to the selfObject
  var capsule = goog.bind(selfObj[methodName], selfObj);

  // go through all the properties and methods of the instance
  for (var prop in selfObj) {
    // check if not private
    if (!prop.match(prvRegex)) {
      // not private, check if func
      if (goog.isFunction(selfObj[prop])) {
        capsule[prop] = goog.bind(selfObj[prop], selfObj);
      } else {
        capsule[prop] = selfObj[prop];
      }
    }
  }

  capsule._instance = selfObj;
  return capsule;

};

