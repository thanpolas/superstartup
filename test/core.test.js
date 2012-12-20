
goog.provide('ssd.test.core');

describe('Core', function(){
  describe('#ss(opt_fn)', function(){
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
});