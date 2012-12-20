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
    ss.listen('custom.eventTwo', cb, obj);
    ss.trigger('custom.eventTwo');
  });

  it('should pass parameters from trigger', function(done){
    function cb (arg1, arg2) {
      expect(arg1).to.be.equal(1);
      expect(arg2).to.be.equal(2);
    }
    ss.listen('custom.eventThree', cb);
    ss.trigger('custom.eventThree', 1, 2);
  });

  it('should remove listeners', function(){
    var cid = ss.listen('custom.eventFour', function(){
      // should never be here
      expect(false).to.be.True;
    });

    ss.removeListener(cid);
    ss.trigger('custom.eventFour');
    expect(true).to.be.True;
  });

  it('should remove all listeners', function(){
    function cb () {
      // should never be here
      expect(false).to.be.True;
    }

    ss.listen('custom.eventFive', cb);
    ss.listen('custom.eventFive', cb);
    ss.listen('custom.eventFive', cb);
    ss.listen('custom.eventFive', cb);

    ss.removeAllListeners('custom.eventFive');
    ss.trigger('custom.eventFive');
    expect(true).to.be.True;
  });

});