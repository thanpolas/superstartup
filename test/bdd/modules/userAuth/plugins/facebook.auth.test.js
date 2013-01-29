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

  var testConfig = {
    pluginName:      'facebook',
    pluginNameSpace: 'fb',
    hasJSAPI:        true,
    pluginResponse:  fixtures.auth.fb.authedObj,
    pluginUDO:       fixtures.auth.fb.udo,
    eventJSLoaded:   eventFB.JSAPILOADED
  };

  // run basic tests
  var genTest = new ssd.test.userAuth.genIface(testConfig);
  genTest.basicTests();

  var stubFBLogin,
      stubFBgetLoginStatus;

  var loginBeforeEach = function() {
    window.fbAsyncInit();
    stubFBLogin = sinon.stub(FB, 'login')
      .yields(fixtures.auth.fb.authedObj);

    stubgetLoginStatus = sinon.stub(FB, 'getLoginStatus')
      .yields();
  };
  var loginAfterEach = function() {
    stubFBLogin.restore();
    stubgetLoginStatus.restore();
  };


  // prepare login callback tests
  var loginTests = new ssd.test.userAuth.genIface(testConfig)
    .setBeforeEach(loginBeforeEach)
    .setAfterEach(loginAfterEach)
  // and run the login tests
    .loginTests();


  // prepare login event tests
  var loginEventTests = new ssd.test.userAuth.genIface(testConfig)
    .setBeforeEach(loginBeforeEach)
    .setAfterEach(loginAfterEach)
  // and run the login event tests
    .loginEvents();
});
