
goog.provide('ssd.test.core');

goog.require('ssd.test.fixture.event');

describe('Core API :: ss()', function(){
  describe('ss()', function(){
    it('should be a function', function(){
      expect( ss ).to.be.a('function');
    });

    it('should have a listen method', function() {
      expect( ss.listen ).to.be.a('function');
    });

    it('should have an init method', function() {
      expect( ss.init ).to.be.a('function');
    });

    it('should have an isReady method', function() {
      expect( ss.isReady ).to.be.a('function');
    });

    it('should report a ready state of false', function(){
      expect( ss.isReady() ).to.be.false;
    });
  });
  describe('Invoke ss() and listen for all events and callbacks', function() {

    var ssCallback = sinon.spy(),
        initCb     = sinon.spy(),
        authChangeCb = sinon.spy(),
        stubSync   = sinon.stub( ss.sync, 'send' ),
        ssReturn;

    stubgetLoginStatus = sinon.stub(FB, 'getLoginStatus')
      .yields();


    describe('Executing ss() and follow up ready methods', function() {

      it('should boot up the app and emit an init event', function(done){
        ss.listen(ssd.test.fixture.event.core.INIT, initCb);
        ss.listen(ssd.test.fixture.event.user.INITIAL_AUTH_STATE, authChangeCb);

        ss.config('user.fb.appId', '123');

        ssReturn = ss( ssCallback );

        expect( ssReturn.always ).to.be.a('function');

        window.fbAsyncInit();

        ssReturn.always(ss.removeAllListeners).always(function() {
          done();
        });
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
    describe('The returned promise', function() {
      it('should have a then method', function() {
        expect( ssReturn.then ).to.be.a('function');
      });
      it('should have an otherwise method', function() {
        expect( ssReturn.otherwise ).to.be.a('function');
      });
      it('should have a yield method', function() {
        expect( ssReturn.yield ).to.be.a('function');
      });
      it('should have a spread method', function() {
        expect( ssReturn.spread ).to.be.a('function');
      });

      it('should immediately invoke fullfilled using then', function() {
        var onFulfilled = sinon.spy(),
            onRejected = sinon.spy();
        ssReturn.then( onFulfilled, onRejected );
        expect( onFulfilled.calledOnce ).to.be.true;
      });
      it('should not invoke rejected using then', function() {
        var onFulfilled = sinon.spy(),
            onRejected = sinon.spy();
        ssReturn.then( onFulfilled, onRejected );
        expect( onRejected.called ).to.be.false;
      });
    });

    //
    //
    // init event
    //
    //
    describe('The init event', function() {
      it('should have triggered the init event', function() {
        expect( initCb.calledOnce ).to.be.true;
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