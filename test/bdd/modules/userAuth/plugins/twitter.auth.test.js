goog.provide('ssd.test.userAuth.twitter');

goog.require('ssd.test.userAuth.genIface');

goog.require('ssd.test.fixture.event');
goog.require('ssd.test.fixture.auth.tw');
goog.require('ssd.test.fixture.userOne');


describe('User Auth Module Plugins :: Twitter', function () {
  var stub;
  var userFix = ssd.test.fixture.userOne;
  var event = ssd.test.fixture.event;
  var eventTW = event.user.facebook;
  var fixtures = ssd.test.fixture;


  var testConfig = {
    pluginName:      'twitter',
    pluginNameSpace: 'tw',
    hasJSAPI:        false,
    pluginUDO:       fixtures.auth.tw.udo,
    // eventJSLoaded:   eventFB.JSAPILOADED,
    eventInitialAuthStatus: eventTW.INITIAL_AUTH_STATUS
  };

  // run basic tests
  var genTest = new ssd.test.userAuth.genIface(testConfig);
  genTest.basicTests();

  var loginBeforeEach = function() {
    ss.config('user.auth.tw.appId', '540');
  };
  var loginAfterEach = function() {
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
