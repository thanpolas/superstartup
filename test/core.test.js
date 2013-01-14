
goog.provide('ssd.test.core');

describe('Core API', function(){
  describe('ss(opt_fn)', function(){
    it('should boot up the application', function(){
      function ssCallback() {
        expect(ss.isReady()).to.be.True;
      }
      expect(ss(ssCallback)).to.not.Throw(Error);
    });

    it('should emit an init event', function(done){
      ss.listen(ssd.test.event.all.INIT, function(){
        done();
      });
      ss();
    });
  });

  describe('new instances of ss()', function () {
    it('should create a new instance', function () {
      var ssNew = new ss();
      expect(ssNew.isReady()).to.be.False;
      // original ss should still remain ready
      expect(ss.isReady()).to.be.True;
    });
  });
});