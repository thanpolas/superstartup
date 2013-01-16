goog.provide('ssd.unitTest.config');

(function(){
  suite('ssd.Config');

  // will contain an instance of ssd.Config
  var config;

  // create a dummy class
  var ClassOne = function(){
    this._config = {
      'polek': 'one',
      'lolek': 'two',
      num: 4,
      ar: []
    };
    // register our config
    if (config) {
      config.register('the.path.to.classOne', this._config);
    }
  };
  goog.inherits(ClassOne, ss.Module);

  // create a config getter
  ClassOne.prototype.get = function(what)
  {
    return this._config[what];
  };

  // A plain object we will reuse
  var PlainObject = function()
  {
    return {
      foo: 'one',
      bar: 'two',
      num: 4,
      ar: []
    };
  };



  test('Register conf from inside a class', function() {
    config = new ssd.Config();
    var classOne = new ClassOne();
    equal(classOne.get('polek'), 'one', 'Default conf values are the same on init');

    // make a configuration change
    config.set('the.path.to.classOne.polek', 'three');
    equal(classOne.get('polek'), 'three', 'The change we did in the Config instance is reflected in the ClassOne instance');
  });



  test('Register conf using a plain object', function() {
    config = new ssd.Config();
    var plainObject = new PlainObject();
    config.register('the.path.for.plainObject', plainObject);
    equal(plainObject.foo, 'one', 'Default conf values are the same on init');

    // make a configuration change
    config.set('the.path.for.plainObject.foo', 'three');
    equal(plainObject.foo, 'three', 'The change we did in the Config instance is reflected in the plain object');

    // register two levels
    config.register('twolevels', {a: 1, b: 2});
    // and register one level
    config.register('onelevel', 2);

    strictEqual(config.get('twolevels.a'), 1, 'A two level path returns correct value');
    strictEqual(config.get('onelevel'), 2, 'A one level path returns correct value');
  });



  test('Error throwing functionality', function(){
    config = new ssd.Config();
    var plainObject = new PlainObject();
    config.register('the.path.for.plainObject', plainObject);

    raises(function(){
      config.set('the.path.for.plainObject.foo', {});
      }, Error, 'We cannot set an object as a value to a specific parameter');

    raises(function(){
      config.set('the.path.for', {});
      }, Error, 'We cannot overwrite a path with an object');

    raises(function(){
      config.set('the.path.for', 1);
      }, Error, 'We cannot overwrite a path with a number');

    raises(function(){
      config.set('the.path.for.plainObject.foo', 3);
      }, TypeError, 'We cannot set a conf key of a different type than the one we registered - string key check');

    raises(function(){
      config.set('the.path.for.plainObject.num', 'four');
      }, TypeError, 'We cannot set a conf key of a different type than the one we registered - number key check');

    raises(function(){
      config.set('the.path.for.plainObject.ar', {});
      }, TypeError, 'We cannot set a conf key of a different type than the one we registered - array key check');

    raises(function(){
      config.register('the.path', 'an overriding value');
      }, Error, 'We cannot overwrite a pre-existing key when registering configs');

  });

})();
