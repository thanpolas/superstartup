goog.provide('ssd.test.userAuth.twitter');

goog.require('ssd.test.userAuth.genIface');

goog.require('ssd.test.fixture.event');
goog.require('ssd.test.fixture.auth.tw');
goog.require('ssd.test.fixture.userOne');


describe('10. User Auth Module Plugins :: Twitter', function () {
  var stub;
  var userFix = ssd.test.fixture.userOne;
  var event = ssd.test.fixture.event;
  var eventTW = event.user.facebook;
  var fixtures = ssd.test.fixture;


  var testConfig = {
    pluginName:      'twitter',
    pluginNameSpace: 'tw',
    hasJSAPI:        false,
    pluginUDO:       null,//fixtures.auth.tw.udo,
    pluginResponse:  'access_token',
    accessToken:     'access_token',
    loginCbArg4Type: 'null',
    loginCbArg5Type: 'string',
    loginCbHasUdo:   false,
    eventInitialAuthStatus: eventTW.INITIAL_AUTH_STATUS
  };

  // run basic tests
  var genTest = new ssd.test.userAuth.genIface(testConfig);
  genTest.basicTests();

  var stubOpen;

  var loginBeforeEach = function() {
    ss.config('user.tw.loginPopup', true);
    stubOpen = sinon.stub(window, 'open');
  };
  var loginAfterLogin = function() {
    ss.user.tw.oauthToken('access_token');
  };
  var loginAfterEach = function() {
    stubOpen.restore();
  };



  // prepare login callback tests
  var loginTests = new ssd.test.userAuth.genIface(testConfig)
    .setBeforeEach(loginBeforeEach)
    .setAfterEach(loginAfterEach)
    .setAfterLogin(loginAfterLogin)
    // and run the login tests
    .loginTests();

  // prepare login event tests
  var loginEventTests = new ssd.test.userAuth.genIface(testConfig)
    .setBeforeEach(loginBeforeEach)
    .setAfterEach(loginAfterEach)
    .setAfterLogin(loginAfterLogin)
    // and run the login event tests
    .loginEvents();
});
