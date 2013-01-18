goog.provide('ssd.test.userAuth.facebook');

goog.require('ssd.test.fixture.event');

describe('User Auth Module Plugins :: Facebook', function () {
  var ssNew;
  var stub;
  var userFix = ssd.test.fixture.userOne;
  var event = ssd.test.fixture.event;
  var eventFB = event.user.facebook;
  window.FB = {
    init: function(params){},
    Event: {
      subscribe: function(event, cb){}
    },
    getLoginStatus: function(cb){}
  };


  beforeEach(function() {
    ssNew = new ss();
  });

  afterEach(function() {
  });


  describe('Startup functions', function(){
    it('should append to DOM a new script element to load FB API', function(done){
      var docStub = sinon.stub(document, 'getElementById');
      docStub.yields({appendChild: function(el){
        done();
        docStub.restore();
      }});

      ssNew();
    });


    it('should initialize the FB API on ss init', function(){
      var docStub = sinon.stub(document, 'getElementById');
      docStub.yields({appendChild: function(el){
        docStub.restore();
      }});

      var mockFBinit = sinon.mock(FB);
      mockFBinit.expects('init').once();

      ssNew();

      window.fbAsyncInit();

      mockFBinit.verify();
      mockFBinit.restore();
    });

    it('should listen for the sessionChange FB event on ss init', function(){
      var docStub = sinon.stub(document, 'getElementById');
      docStub.yields({appendChild: function(el){
        docStub.restore();
      }});

      var stubFBEvent = sinon.stub(FB.Event, 'subscribe');

      ssNew();
      window.fbAsyncInit();

      expect(stubFBEvent.calledOnce).to.be.true;
      expect(stubFBEvent.getCall(0).args[0]).to.equal('auth.sessionChange');

      stubFBEvent.restore();
    });


    it('should trigger FB API LOADED event', function(){
      var docStub = sinon.stub(document, 'getElementById');
      docStub.yields({appendChild: function(el){
        docStub.restore();
      }});

      var mockCB = sinon.expectation.create('eventCallback');
      mockCB.once();

      ssNew.listen(eventFB.JSAPILOADED, mockCB);
      ssNew();

      window.fbAsyncInit();
      mockCB.verify();
    });

    it('should check for initial auth status', function(done){
      var docStub = sinon.stub(document, 'getElementById');
      docStub.yields({appendChild: function(el){
        docStub.restore();
      }});

      var mockGetLogin = sinon.mock(FB);
      mockGetLogin.expects('getLoginStatus').once();

      ssNew();
      window.fbAsyncInit();
      mockGetLogin.restore();
    });
  });


});