/**
 * @fileOverview Test the events API
 */
goog.provide('ssd.test.event.api');


describe('Events API', function(){

  beforeEach(function() {
  });
  afterEach(function() {
    ss.removeAllListeners();
  });

  it('should listen and trigger arbitrary events', function(done){
    function cb () {
      done();
    }
    ss.listen('custom.event', cb);
    ss.trigger('custom.event');
  });

  it('should cancel execution if listener executes preventDefault', function(done){
    function cb (eventObj) {
      eventObj.preventDefault();
    }
    ss.listen('custom.event', cb);
    expect(ss.trigger('custom.event')).to.be.false;
    done();
  });

  it('should cancel execution if listener returns false', function(done){
    function cb (eventObj) {
      return false;
    }
    ss.listen('custom.event', cb);
    expect(ss.trigger('custom.event')).to.be.false;
    done();
  });

  it('should allow for binding of selfObj', function(done){
    var obj = {
      a: 1
    };
    function cb (eventObj) {
      expect(this.a).to.be.equal(1);
      done();
    }
    ss.listen('custom.eventTwo', cb, obj);
    ss.trigger('custom.eventTwo');
  });

  it('should pass parameters from trigger', function(done){
    function cb (eventObj) {
      expect(eventObj.arg1).to.be.equal(1);
      expect(eventObj.arg2).to.be.equal(2);
      done();
    }
    ss.listen('custom.eventThree', cb);
    var eventObj = {
      type: 'custom.eventThree',
      arg1: 1,
      arg2: 2
    };
    ss.trigger(eventObj);
  });

  it('should remove listeners', function(){
    var cid = ss.listen('custom.eventFour', function(){
      // should never be here
      expect(false).to.be.true;
    });

    ss.unlisten(cid);
    ss.trigger('custom.eventFour');
    expect(true).to.be.true;
  });

  it('should remove all listeners', function(){
    function cb () {
      // should never be here
      expect(false).to.be.true;
    }

    ss.listen('custom.eventFive', cb);
    ss.listen('custom.eventFive', cb);
    ss.listen('custom.eventSix', cb);
    ss.listen('custom.eventSeven', cb);

    var n = ss.removeAllListeners();
    ss.trigger('custom.eventFive');
    expect(true).to.be.true;
  });

});
