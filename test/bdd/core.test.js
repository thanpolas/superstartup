
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
  });
  describe('new instances of ss()', function () {
    it('should create a new instance', function () {
      var ssNew = new ss();
      expect(ssNew.isReady()).to.be.false;
      // original ss should still remain ready
      expect(ss.isReady()).to.be.true;
    });
  });

  describe('core methods and events ::', function() {
    it('new instance should be a function', function(){
      var ssNew = new ss();
      expect( ssNew ).to.be.a('function');
    });

    it('should accept a callback on init', function(done) {
      function ssCallback() {
        expect( ss.isReady() ).to.be.true;
        done();
      }

      var ssNew = new ss();
      ssNew(ssCallback);
    });


    it('should emit an init event', function(done){
      var ssNew = new ss();
      ssNew.listen(ssd.test.fixture.event.core.INIT, function(){
        expect( true ).to.be.true;
        done();
      });
      ssNew();
    });
  });

});