
goog.provide('ssd.test.core');

describe('Core API', function(){
  describe('ss(opt_fn)', function(){
    it('should boot up the application', function(done){
      function ssCallback() {
        expect(ss.isReady()).to.be.True;
        done();
      }
      expect(ss(ssCallback)).to.not.Throw(Error);
    });

    it('should emit an init event', function(done){
      ss.linsten(ssd.test.event.all.INIT, function(){
        done();
      });
      ss();
    });
  });

  describe('ss.new()', function () {
    it('should create a new instance', function () {
      var ssNew = ss.new();
      expect(ss.isReady()).to.be.False;
    });
  });
});