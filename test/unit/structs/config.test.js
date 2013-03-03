goog.provide('ssd.test.unit.config');

goog.require('ssd.Config');
goog.require('ssd.test.unit.configClass');



suite('ssd.Config', function() {

  // will contain an instance of ssd.Config
  var rootClass;

  // A plain object we will reuse
  var PlainObject = function()
  {
    return {
      foo: 'one',
      bar: 'two',
      num: 4,
      ar: [],
      bool: true
    };
  };



  suite('ssd.Config class unit tests', function() {
    var config;
    beforeEach(function() {
      config = new ssd.Config();
    });
    suite('ssd.Config class root path level', function() {

      test('set a param', function() {
        assert.doesNotThrow( goog.partial(config, 'one', 1), 'setting a param should not throw an error');
      });

      test('set params using addAll()', function() {
        assert.doesNotThrow( goog.partial(config.addAll, {'one': 1}), 'setting param using addAll should not throw an error');
      });

      test('Access a param using set', function() {
        config('one', 1);
        assert.equal(config('one'), 1, 'using config( param ); method');
      });

      test('Access params using addAll', function() {
        var params = new PlainObject();
        config.addAll(params);
        assert.strictEqual(config('foo'), params.foo, 'get values from addAll() set method');
        assert.strictEqual(config('num'), params.num, 'get values from addAll() set method');
        assert.strictEqual(config('bool'), params.bool, 'get values from addAll() set method');
      });

      test('Calling with no params return the whole object', function() {
        var params = new PlainObject();
        config.addAll(params);
        assert.deepEqual(config(), params, 'no params should return the whole object');
      });
    });




    suite('ssd.Config class second level path', function() {

      var secondConfig;
      beforeEach(function(){
        secondConfig = config.prependPath( 'the.path.to.classOne');
      });


      test('set a param', function() {
        assert.doesNotThrow( goog.partial(secondConfig, 'one', 1), 'setting a param should not throw an error');
      });

      test('set params using addAll()', function() {
        assert.doesNotThrow( goog.partial(secondConfig.addAll, {'one': 1}), 'setting param using addAll should not throw an error');
      });

      test('Access a param using rel path', function() {
        secondConfig('one', 1);
        assert.equal(secondConfig('one'), 1, 'using secondConfig( param ); rel path');
      });
      test('Access a param using absolute path', function() {
        secondConfig('one', 1);
        assert.equal(config('the.path.to.classOne.one'), 1, 'using config( param ); abs path');
      });

      test('Access params by addAll using rel path', function() {
        var params = new PlainObject();
        secondConfig.addAll(params);
        assert.strictEqual(secondConfig('foo'), params.foo, 'get values from addAll() using rel path');
        assert.strictEqual(secondConfig('num'), params.num, 'get values from addAll() using rel path');
        assert.strictEqual(secondConfig('bool'), params.bool, 'get values from addAll() using rel path');
      });
      test('Access params by addAll using abs path', function() {
        var params = new PlainObject();
        secondConfig.addAll(params);
        assert.strictEqual(config('the.path.to.classOne.foo'), params.foo, 'get values from addAll() using abs path');
        assert.strictEqual(config('the.path.to.classOne.num'), params.num, 'get values from addAll() using abs path');
        assert.strictEqual(config('the.path.to.classOne.bool'), params.bool, 'get values from addAll() using abs path');
      });

      test('Calling with no params return the whole object', function() {
        var params = new PlainObject();
        secondConfig.addAll(params);
        assert.deepEqual( secondConfig(), params, 'no params should return the whole object');
      });

      test('Set a second level config param and crosscheck abs / rel path',
        function() {
        secondConfig.set('num', 740);
        config.set('the.path.to.classOne.lolek', 'three');

        assert.strictEqual(secondConfig('lolek'), 'three',
          'check crosscheck access of rel/abs set params. Should be three');
        assert.strictEqual(config('the.path.to.classOne.num'), 740,
          'check crosscheck access of rel/abs set params. Should be 740');
      });
    });
  });

  suite('Root class config', function() {
    beforeEach(function(){
      rootClass = new ssd.test.unit.configClass.RootClass();
    });

    test('Access a root config param', function() {
      assert.equal(rootClass.config('name'), 'rootClass', 'using rootClass.config( param ); method');
    });

    test('Check type of root config param', function() {
      assert.strictEqual(rootClass.config('bool'), true, 'Checking type for boolean');
      assert.strictEqual(rootClass.config('howmany'), 42, 'Checking type for numeric');
    });

    test('Set a root config param and access it', function() {
      rootClass.config.set('howmany', 540);
      assert.equal(rootClass.config('howmany'), 540, 'set a config param and expect to get the value we set (540)');
    });
  });


  //
  //
  // Second level class
  //
  //
  suite('Second level class config', function() {

    beforeEach(function(){
      rootClass = new ssd.test.unit.configClass.RootClass();
    });

    test('Access a config param', function() {
      assert.equal(rootClass.config('the.path.to.classOne.polek'), 'one',
        'using the full path to access a second level class config');
    });

    test('Access a config param from the second class instance', function() {
      assert.equal(rootClass.classOne.config('polek'), 'one',
        'using rel path to access a second level class config');
    });

    test('Check type of second level config param', function() {
      assert.strictEqual(rootClass.classOne.config('bool'), true,
        'Checking type for boolean');
      assert.strictEqual(rootClass.classOne.config('num'), 4,
        'Checking type for numeric');
      assert.isArray(rootClass.classOne.config('ar'),
        'Checking type for array');
      assert.strictEqual(rootClass.classOne.config('ar')[1], 2,
        'Checking type for array value');
    });

    test('Set a second level config param relatively and access it',function() {
      rootClass.classOne.config.set('num', 540);
      assert.strictEqual(rootClass.classOne.config('num'), 540,
        'set a config param and expect to get the value we set (540)');
    });

    test('Set a second level config param with absolute path and access it',
      function() {
      rootClass.config.set('the.path.to.classOne.num', 540);
      assert.strictEqual(rootClass.config('the.path.to.classOne.num'), 540,
        'set a config param and expect to get the value we set (540)');
    });

    test('Set a second level config param and crosscheck abs / rel path',
      function() {
      rootClass.classOne.config.set('num', 740);
      rootClass.config.set('the.path.to.classOne.lolek', 'three');

      assert.strictEqual(rootClass.classOne.config('lolek'), 'three',
        'check crosscheck access of rel/abs set params. Should be three');
      assert.strictEqual(rootClass.config('the.path.to.classOne.num'), 740,
        'check crosscheck access of rel/abs set params. Should be 740');
    });

    suite('Cascaging get of values', function() {
      test('cascading get of values', function() {
        assert.strictEqual( rootClass.classOne.config('howmany'), 42,
          'The undefined howmany param should cascade to the root and return the root value');
      });
      test('cascading get of values on root instance', function() {
        assert.strictEqual( rootClass.config('what.ever.path.howmany'), 42,
          'The undefined howmany param should cascade to the root and return the root value');
      });
    });

  });

  suite('Error throwing functionality', function() {
    test('Error throwing functionality', function() {
      var config = new ssd.Config({
        id: 1,
        path: {
          val: 'val'
        },
        another: 'two',
        ar: [4, 5, 6]
      });

      assert.throws(function(){
        config.set('aKey', {});
        }, Error, 'cannot set an object as a value to a specific parameter');

      assert.throws(function(){
        config.set('path', {});
        }, Error, 'cannot overwrite a path with an object');

      assert.throws(function(){
        config.set('path', 1);
        }, Error, 'cannot overwrite a path with a number');

      assert.throws(function(){
        config.set('another', 3);
        }, TypeError,
        'cannot set a conf key of a different type than the one we registered' +
        ' - string key check');

      assert.throws(function(){
        config.set('id', 'four');
        }, TypeError, 'cannot set a conf key of a different type than the one' +
        ' we registered - number key check');

      assert.throws(function(){
        config.set('ar', {});
        }, TypeError, 'cannot set a conf key of a different type than the one' +
        ' we registered - array key check');
    });
  });
});
