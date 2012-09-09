

goog.provide('ssd.capsule');


/**
 * The Capsule method creates a new instance of the provided constructor
 * which is also linked to a method that it contains.
 *
 * Capsule only works for pseudo-classical type of classes (prototypical).
 *
 * Consider this use case:
 *
 * var classOne = function(){};
 * classOne.prototype.foo = function(){}; // a method of classOne
 * classOne.prototype.bar = function(){}; // another method of classOne
 *
 * var clOne = ssd.capsule(classOne, 'foo');
 *
 * clOne() === clOne.foo();
 *
 * @param {Function} parentCtor The constructor we will be encapsulating
 * @param {string} methodName The target method name we want to apply on
 *                             the created instance
 * @param {Regex=} opt_prvRegex A regex that matches the methods and properties
 *                              that are private, e.g. classOne.prototype._prv
 * @return {Function} An instance of parentCtor, that when invoked executes the
 *                    target method, and with all the public properties / methods
 *                    exposed.
 */
ssd.capsule = function(parentCtor, methodName, opt_prvRegex)
{

  // if regex not defined, default is to match every
  // string that is _ or starts with _ or ends with _
  var prvRegex = opt_prvRegex || /^(_|_.+|.+_)$/;

  var selfObj = new parentCtor();

  // create the capsule and assign the target method binded
  // to the selfObject
  var capsule = goog.bind(selfObj[methodName], selfObj);

  // go through all the properties and methods of the instance
  for (var prop in selfObj) {
    // check if not private
    if (!prop.match(prvRegex)) {
      // not private, check if func
      if (ssd.types.FUNCTION == goog.typeOf(selfObj[prop])) {
        capsule[prop] = goog.bind(selfObj[prop], selfObj);
      } else {
        capsule[prop] = selfObj[prop];
      }

    }
  }

  return capsule;

};

