
goog.provide('ssd.test.core');

goog.require('ssd.test.fixture.event');

describe('0. Core API :: ss()', function(){
  describe('0.0 ss()', function(){
    it('0.0.1 should be a function', function(){
      expect( ss ).to.be.a('function');
    });

    it('0.0.2 should have a listen method', function() {
      expect( ss.listen ).to.be.a('function');
    });

    it('0.0.3 should have an init method', function() {
      expect( ss.init ).to.be.a('function');
    });

    it('0.0.4 should have an isReady method', function() {
      expect( ss.isReady ).to.be.a('function');
    });

    it('0.0.5 should report a ready state of false', function(){
      expect( ss.isReady() ).to.be.false;
    });
  });
  describe('0.1 Invoke ss() and listen for all events and callbacks', function() {

    var ssCallback = sinon.spy();
    var initEventCb = sinon.spy();
    var authChangeCb = sinon.spy();
    var stubSync = sinon.stub( ss.sync, 'send' );
    var ssReturn;

    stubgetLoginStatus = sinon.stub(FB, 'getLoginStatus')
      .yields();


    describe('0.1.1 Executing ss() and follow up ready methods', function() {

      it('should boot up the app and emit an init event', function(done){
        ss.listen(ssd.test.fixture.event.core.INIT, initEventCb);
        ss.listen(ssd.test.fixture.event.user.INITIAL_AUTH_STATE, authChangeCb);

        ss.config('user.fb.appId', '123');

        ssReturn = ss( ssCallback );

        expect( ssReturn.always ).to.be.a('function');

        window.fbAsyncInit();

        ssReturn.ensure(ss.removeAllListeners).ensure(done);
      });

      it('should have not made any sync calls', function() {
        expect( stubSync.called ).to.be.false;
        stubSync.restore();
      });

      it('should report a ready state of true', function(){
        expect( ss.isReady() ).to.be.true;
      });

      it('should accept a callback that immediately invokes', function() {
        var spy = sinon.spy();
        ss( spy );
        expect( spy.calledOnce ).to.be.true;
      });
    });

    //
    //
    // The returned promise
    //
    //
    describe('0.1.2 The returned promise', function() {
      it('0.1.2.1 should be a promise', function() {
        expect( when.isPromise(ssReturn) ).to.be.true;
      });
      it('0.1.2.2 should be fulfilled', function(done) {
        expect(ssReturn).to.be.fulfilled.notify(done);
      });
    });

    //
    //
    // init event
    //
    //
    describe('0.1.4 The core.init event', function() {
      it('0.1.4.1 should have triggered the init event', function() {
        expect( initEventCb.calledOnce ).to.be.true;
      });
    });


    //
    //
    // init callback
    //
    //
    describe('The init callback', function() {
      it('should have triggered the init callback', function() {
        expect( ssCallback.calledOnce ).to.be.true;
      });
    });


    //
    //
    // initial auth state
    //
    //
    describe('The initial auth state event', function() {
      it('should have triggered the initial auth state event', function() {
        expect( authChangeCb.calledOnce ).to.be.true;
      });
      it('should have the authState property', function() {
        expect( authChangeCb.calledOnce ).to.be.true;
        var ev = authChangeCb.getCall(0).args[0];
        expect( ev.authState ).to.be.a('boolean');
        expect( ev.authState ).to.be.false;
      });
    });


  });
});
