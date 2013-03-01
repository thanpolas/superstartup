
goog.provide('ssd.test.core');

goog.require('ssd.test.fixture.event');

describe('Core API', function(){
  describe('ss()', function(){
    it('should be a function', function(){
      expect( ss ).to.be.a('function');
    });

    it('should boot up the application', function(){
      expect( ss ).to.not.Throw(Error);
    });

    it('should report a ready state of true', function(){
      expect( ss.isReady()).to.be.true;
    });
  });
  describe('new instances of ss()', function () {
    var ssNew = new ss();
    it('should create a new instance', function () {
      expect( ssNew.isReady() ).to.be.false;
    });
    it('should be a function', function(){
      expect( ssNew ).to.be.a('function');
    });

    it('should boot up the application', function(){
      expect( ssNew ).to.not.Throw(Error);
    });

    it('should report a ready state of true', function(){
      expect( ssNew.isReady()).to.be.true;
    });
    it('should not affect the original ss instance ready state', function() {
      // original ss should still remain ready
      expect(ss.isReady()).to.be.true;
    });
  });

  describe('core methods and events ::', function() {
    var ssNew;
    beforeEach( function() {
      ssNew = new ss();
    });
    afterEach( function() {
    });

    it('new instance should be a function', function(){
      expect( ssNew ).to.be.a('function');
    });

    it('should accept a callback on init', function(done) {
      var ssCallback = function() {
        expect( true ).to.be.true;
        done();
      };

      ssNew(ssCallback);
    });

    it('should report false on isReady prior to init', function() {
      expect( ssNew.isReady() ).to.be.false;
    });

    it('should report true in callback', function( done ) {
      var ssCallback = function() {
        expect( ssNew.isReady() ).to.be.true;
        done();
      };

      ssNew( ssCallback );
    });

    it('should emit an init event', function(done){
      ssNew.listen(ssd.test.fixture.event.core.INIT, function(){
        expect( true ).to.be.true;
        done();
      });
      ssNew();
    });
  });

});