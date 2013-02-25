/**
 * @fileOverview Test the events API
 */
goog.provide('ssd.test.event.api');


describe('Events API', function(){
  var ssNew;

  beforeEach(function() {
    ssNew = new ss();
    ssNew();
  });
  afterEach(function() {
  });

  it('should listen and trigger arbitrary events', function(done){
    function cb () {
      done();
    }
    ssNew.listen('custom.event', cb);
    ssNew.trigger('custom.event');
  });

  it('should cancel execution if listener executes preventDefault', function(done){
    function cb (eventObj) {
      eventObj.preventDefault();
    }
    ssNew.listen('custom.event', cb);
    expect(ssNew.trigger('custom.event')).to.be.false;
    done();
  });

  it('should cancel execution if listener returns false', function(done){
    function cb (eventObj) {
      return false;
    }
    ssNew.listen('custom.event', cb);
    expect(ssNew.trigger('custom.event')).to.be.false;
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
    ssNew.listen('custom.eventTwo', cb, obj);
    ssNew.trigger('custom.eventTwo');
  });

  it('should pass parameters from trigger', function(done){
    function cb (eventObj) {
      expect(eventObj.arg1).to.be.equal(1);
      expect(eventObj.arg2).to.be.equal(2);
      done();
    }
    ssNew.listen('custom.eventThree', cb);
    var eventObj = {
      type: 'custom.eventThree',
      arg1: 1,
      arg2: 2
    };
    ssNew.trigger(eventObj);
  });

  it('should remove listeners', function(){
    var cid = ssNew.listen('custom.eventFour', function(){
      // should never be here
      expect(false).to.be.true;
    });

    ssNew.unlisten(cid);
    ssNew.trigger('custom.eventFour');
    expect(true).to.be.true;
  });

  it('should remove all listeners', function(){
    function cb () {
      // should never be here
      expect(false).to.be.true;
    }

    ssNew.listen('custom.eventFive', cb);
    ssNew.listen('custom.eventFive', cb);
    ssNew.listen('custom.eventSix', cb);
    ssNew.listen('custom.eventSeven', cb);

    var n = ssNew.removeAllListeners();
    ssNew.trigger('custom.eventFive');
    expect(true).to.be.true;
  });

});