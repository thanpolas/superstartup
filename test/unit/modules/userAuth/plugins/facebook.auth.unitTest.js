goog.provide('ssd.unitTest.userAuth.facebook');

goog.require('ssd.test.fixture.event');
goog.require('ssd.test.fixture.auth.fb');
goog.require('ssd.test.fixture.userOne');


describe('User Auth Module Plugins :: Facebook', function () {
  var ssNew;
  var stub;
  var userFix = ssd.test.fixture.userOne;
  var event = ssd.test.fixture.event;
  var eventFB = event.user.facebook;
  var fixtures = ssd.test.fixture;

  window.FB = {
    init: function(params){},
    Event: {
      subscribe: function(event, cb){}
    },
    getLoginStatus: function(cb){},
    login: function(cb, params){}
  };


  beforeEach(function() {
    ssNew = new ss();
  });

  afterEach(function() {
  });


  describe('Startup functions', function(){
    it('should initialize the FB API on ss init', function() {
      var mockFBinit = sinon.mock(FB);
      mockFBinit.expects('init').once();

      ssNew();
      window.fbAsyncInit();

      mockFBinit.verify();
      mockFBinit.restore();
    });

    it('should listen for the authResponseChange FB event on ss.init()', function() {
      var stubFBEvent = sinon.stub(FB.Event, 'subscribe');
      ssNew();
      window.fbAsyncInit();

      expect(stubFBEvent.calledOnce).to.be.true;
      expect(stubFBEvent.getCall(0).args[0]).to.equal('auth.authResponseChange');

      stubFBEvent.restore();
    });


    it('should trigger FB API LOADED event', function() {
      var mockCB = sinon.expectation.create('eventCallback');
      mockCB.once();

      ssNew.listen(eventFB.JSAPILOADED, mockCB);
      ssNew();

      window.fbAsyncInit();
      mockCB.verify();
    });

    it('should check for initial auth status', function() {
      var mockGetLogin = sinon.mock(FB);
      mockGetLogin.expects('getLoginStatus').once();

      ssNew();
      window.fbAsyncInit();
      mockGetLogin.verify();
      mockGetLogin.restore();
    });
  });

  describe('Login functions', function(){
    beforeEach(function() {
      ssNew();
      window.fbAsyncInit();
      stubFBLogin = sinon.stub(FB, 'login');
      stubFBLogin.yields(fixtures.auth.fb.authedObj);
      stubNet = sinon.stub(ssNew.net, 'sync');
      stubNet.yields(fixtures.userOne);
    });

    afterEach(function() {
      stubFBLogin.restore();
    });

    it('should call FB.login', function(){

      ssNew.user.fb.login();

      expect(stubFBLogin.calledOnce).to.be.true;
      var callArgs = stubFBLogin.getCall(0).args;
      expect(callArgs[0]).to.be.a('function');
      expect(callArgs[1]).to.be.an('object');

    });
  });

});