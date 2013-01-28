goog.provide('ssd.test.userAuth.facebook');

goog.require('ssd.test.userAuth.genIface');

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

  // run basic tests
  var genTest = new ssd.test.userAuth.genIface('fb', 'facebook');
  genTest.basicTests();


  var loginBeforeEach = function() {
    window.fbAsyncInit();
    var stubFBLogin = sinon.stub(FB, 'login');
    stubFBLogin.yields(fixtures.auth.fb.authedObj);
  };
  var loginAfterEach = function() {
    stubFBLogin.restore();
  };


  // prepare login callback tests
  var loginTests = new ssd.test.userAuth.genIface('fb', 'facebook');
  loginTests.setBeforeEach(loginBeforeEach);
  loginTests.setAfterEach(loginAfterEach);
  // and run the login callback tests
  loginTests.loginCallback(fixtures.auth.fb.authedObj, fixtures.auth.fb.udo);


  // prepare login event tests
  var loginEventTests = new ssd.test.userAuth.genIface('fb', 'facebook');
  loginEventTests.setBeforeEach(loginBeforeEach);
  loginEventTests.setAfterEach(loginAfterEach);
  // and run the login event tests
  loginEventTests.loginEvents(fixtures.auth.fb.authedObj, fixtures.auth.fb.udo, eventFB.JSAPILOADED);


});