
goog.provide('ssd.test.config');

(function(){

  // will contain an instance of ss.Config
  var config;
  console.log('ssd', ssd.Module);

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
  goog.inherits(ClassOne, ssd.Module);


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


  describe('Config Class', function(){
    describe('Register conf from inside a class', function() {
      var classOne;
      before(function(){
        config = new ssd.Config();
        classOne = new ClassOne();
      });

      it('Default conf values are the same on init', function(){
        expect(  classOne.get('polek')  ).to.be.equal('one');
      });

      it('The change we did in the Config instance is reflected in the ClassOne instance', function(){
        // make a configuration change
        config.set('the.path.to.classOne.polek', 'three');
        expect(  classOne.get('polek')  ).to.be.equal('three');
      });
    });



    describe('Register conf using a plain object', function() {
      var plainObject;
      before(function(){
        config = new ssd.Config();
        plainObject = new PlainObject();
      });

      config.register('the.path.for.plainObject', plainObject);

      it('Default conf values are the same on init', function(){
        expect(  plainObject.foo  ).to.be.equal('one');
      });

      // make a configuration change
      it('The change we did in the Config instance is reflected in the plain object', function(){
        config.set('the.path.for.plainObject.foo', 'three');
        expect(  plainObject.foo  ).to.be.equal('three');
      });

      it('A two level path returns correct value', function(){
        // register two levels
        config.register('twolevels', {a: 1, b: 2});
        // and register one level
        config.register('onelevel', 2);
        expect(  config.get('twolevels.a')  ).to.be.equal(1);
      });

      it('A one level path returns correct value', function(){
        expect(  config.get('onelevel')  ).to.be.equal(2);
      });
    });



    describe('Error throwing functionality', function(){
      config = new ssd.Config();
      var plainObject = new PlainObject();
      config.register('the.path.for.plainObject', plainObject);

      it('We cannot set an object as a value to a specific parameter', function() {
        expect(  function(){
          config.set('the.path.for.plainObject.foo', {});
        }  ).to.Throw(Error);
      });
      it('We cannot overwrite a path with an object', function() {
        expect(  function(){
          config.set('the.path.for', {});
        }  ).to.Throw(Error);
      });
      it('We cannot overwrite a path with a number', function() {
        expect(  function(){
          config.set('the.path.for', 1);
        }  ).to.Throw(Error);
      });
      it('We cannot set a conf key of a different type than the one we registered - string key check', function() {
        expect(  function(){
          config.set('the.path.for.plainObject.foo', 3);
        }  ).to.Throw(TypeError);
      });
      it('We cannot set a conf key of a different type than the one we registered - number key check', function() {
        expect(  function(){
          config.set('the.path.for.plainObject.num', 'four');
        }  ).to.Throw(TypeError);
      });
      it('We cannot set a conf key of a different type than the one we registered - array key check', function() {
        expect(  function(){
          config.set('the.path.for.plainObject.ar', {});
        }  ).to.Throw(TypeError);
      });
      it('We cannot overwrite a pre-existing key when registering configs', function() {
        expect(  function(){
          config.register('the.path', 'an overriding value');
        }  ).to.Throw(Error);
      });
    });
  });
})();

