goog.provide('ssd.test.userAuth.facebook');

goog.require('ssd.test.userAuth.genIface');

goog.require('ssd.test.fixture.event');
goog.require('ssd.test.fixture.auth.fb');
goog.require('ssd.test.fixture.userOne');


describe('User Auth Module Plugins :: Facebook', function () {
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
    accessToken:     'ACCESS_TOKEN',
    pluginUDO:       fixtures.auth.fb.udo,
    eventJSLoaded:   eventFB.JSAPILOADED,
    eventInitialAuthStatus: eventFB.INITIAL_AUTH_STATUS
  };

  // run basic tests
  var genTest = new ssd.test.userAuth.genIface(testConfig);
  genTest.basicTests();

  var stubFBLogin,
      stubFBgetLoginStatus,
      stubFBapi;

  var loginBeforeEach = function() {
    ss.config('user.fb.appId', '540');
    window.fbAsyncInit();


    if (FB.login.id) { FB.login.restore(); }
    stubFBLogin = sinon.stub(FB, 'login')
      .yields(fixtures.auth.fb.authedObj);

    if (FB.api.id) { FB.api.restore(); }
    stubFBapi = sinon.stub(FB, 'api')
      .yields(fixtures.auth.fb.udo);

    if (FB.getLoginStatus.id) { FB.getLoginStatus.restore(); }
    stubgetLoginStatus = sinon.stub(FB, 'getLoginStatus')
      .yields();
  };
  var loginAfterEach = function() {
    stubFBLogin.restore();
    stubgetLoginStatus.restore();
    stubFBapi.restore();
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
