/**
 * @fileOverview Test the events API
 */
goog.provide('ssd.test.event.api');


describe('Events API', function(){
  it('should listen and trigger arbitrary events', function(done){
    function cb () {
      done();
    }

    ss.listen('custom.event', cb);
    ss.trigger('custom.event');
  });

  it('should allow for binding of selfObj', function(done){
    var obj = {
      a: 1
    };
    function cb () {
      expect(this.a).to.be.equal(1);
    }
    ss.listen('custom.event', cb, obj);
    ss.trigger('custom.event');
  });

  it('should pass parameters from trigger', function(done){
    function cb (arg1, arg2) {
      expect(arg1).to.be.equal(1);
      expect(arg2).to.be.equal(2);
    }
    ss.listen('custom.event', cb);
    ss.trigger('custom.event', 1, 2);
  });


});