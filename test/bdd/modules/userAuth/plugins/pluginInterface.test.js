/**
 * @fileOverview The generic interface test that every
 *               auth plugin should pass
 */

goog.provide('ssd.test.userAuth.genIface');

goog.require('ssd.test.fixture.event');
goog.require('ssd.test.fixture.userOne');

/**
 * @param  {Object} params Parameters to run the tests. Keys
 *                         contain:
 *  pluginName  {string}  The canonical name of the plugin as
 *                         used inside the ss library
 *  pluginSpace {string}  The namespace in the JS
 *     object chain where the plugin exists. e.g. 'fb' for:
 *     ss.user.fb.
 *  hasJSAPI    {boolean} If the plugin has a JS API
 *  pluginResponse {Object} the plugin's response data object on
 *                                successful auth operations.
 *  pluginUDO {Object} The plugin's User Data Object
 *                            as provided by the plugin.
 *  eventJSLoaded {string}  The event triggered when the plugin's
 *                                JS API has been loaded.
 * @constructor
 */
ssd.test.userAuth.genIface = function(params) {
  this.pluginName     = params.pluginName;
  this.pluginSpace    = params.pluginSpace;
  this.hasJSAPI       = params.hasJSAPI;
  this.pluginResponse = params.pluginResponse;
  this.pluginUDO      = params.pluginUDO;
  this.eventJSLoaded  = params.eventJSLoaded;
  this.eventInitialAuthStatus = params.eventInitialAuthStatus;

  this.beforeEach = function(){};
  this.afterEach = function(){};

  return this;
};

/**
 * [setBeforeEach description]
 * @param {Function} fn [description]
 */
ssd.test.userAuth.genIface.prototype.setBeforeEach = function(fn){
  this.beforeEach = fn;
  return this;
};
/**
 * [setAfterEach description]
 * @param {Function} fn [description]
 */
ssd.test.userAuth.genIface.prototype.setAfterEach = function(fn){
  this.afterEach = fn;
  return this;
};



/**
 * Perform basic tests that every third-party auth plugin
 * should pass.
 *
 *
 */
ssd.test.userAuth.genIface.prototype.basicTests = function() {

  var _this = this;
  var ssNew;
  var plugin;

  describe('Proper Interface implementation for ' + _this.pluginName, function(){

    beforeEach(function() {
      ssNew = new ss();
      plugin = ssNew.user[_this.pluginPathname];
      _this.beforeEach();
    });

    afterEach(function() {
      _this.afterEach();
    });

    it('should have a getSourceId() method', function(){
      expect(plugin.getSourceId).to.be.a('function');
    });
    it('getSourceId() should return the plugin name', function(){
      expect(plugin.getSourceId()).to.equal(pluginName);
    });
    it('should have a login() method', function(){
      expect(plugin.login).to.be.a('function');
    });
    it('should have a hasJSAPI() method which returns boolean', function(){
      expect(plugin.hasJSAPI()).to.be.a.boolean;
    });
    it('should have a logout() method', function(){
      expect(plugin.logout).to.be.a('function');
    });
    it('should have an isAuthed() method and return boolean', function(){
      expect(plugin.isAuthed).to.be.a('function');
      expect(plugin.isAuthed()).to.be.a('boolean');
    });
    it('should have a getUser() method', function(){
      expect(plugin.getUser).to.be.a('function');
    });
    it('getUser() should return null when not authed with the plugin', function(){
      expect(plugin.getUser()).to.be.a('null');
    });
    it('should have a getAccessToken() method', function(){
      expect(plugin.getAccessToken).to.be.a('function');
    });
    it('getAccessToken() should always return string', function(){
      expect(plugin.getAccessToken()).to.be.a('string');
    });
    it('should have a logout method', function(){
      expect(plugin.logout).to.be.a('function');
    });
  });
};

/**
 * Basic events and initialization tests
 *
 */
ssd.test.userAuth.getIface.prototype.basicEventsInitTests = function() {
  var _this = this;

  describe('Basic events emitted for plugin:' + _this.pluginName, function() {
    it('should emit the initial auth status event', function(done){
      ssNew.listen(_this.eventInitialAuthStatus, function(eventObj){
        expect(eventObj).to.be.a('boolean');
        done();
      });
      ssNew();
    });

    if (_this.hasJSAPI) {
      it('should emit the JS API Loaded event', function(done){
        ssNew.listen(_this.eventJSLoaded, function(eventObj){
          done();
        });
        ssNew();
      });
    }

  });

};

/**
 * Plugin Login tests.
 *
 * Execute these tests after you have properly stubbed or mocked
 * the payload of the plugin's login method. For every test run it
 * should authenticate us with the UDO provided as param in this method.
 *
 *
 */
ssd.test.userAuth.genIface.prototype.loginTests = function() {
  var _this = this;
      ssNew,
      plugin,
      stubNet;

  describe('Login tests for plugin: ' + _this.pluginName, function(){

    beforeEach(function(done) {
      ssNew = new ss();
      plugin = ssNew.user[_this.pluginPathname];
      stubNet = sinon.stub(ssNew.net, 'sync');
      stubNet.yields(fixtures.userOne);

      _this.beforeEach();
      ssNew(done);
    });

    afterEach(function() {
      stubNet.restore();
      _this.afterEach();
    });

    it('should return ' + _this.hasJSAPI + ' when asked if hasJSAPI()', function(){
      expect(plugin.hasJSAPI()).to.equal(_this.hasJSAPI);
    });

    it('should have a working callback', function(){
      var mockCB = sinon.expectation.create('loginCB');
      mockCB.once();
      plugin.login(mockCB);
      mockCB.verify();
    });

    it('should have a callback with two arguments', function(){
      var mockCB = sinon.expectation.create('loginCB');
      mockCB.once();
      plugin.login(mockCB);
      // First argument is auth status, should be true
      // because plugin's payload has been mocked
      // with a successful behavior by default.
      expect(mockCB.getCall(0).args[0]).to.be.a('boolean');
      expect(mockCB.getCall(0).args[0]).to.be.true;
      // response object returned by the plugin
      expect(mockCB.getCall(0).args[1]).to.be.an('object');
      expect(mockCB.getCall(0).args[1]).to.deep.equal(_this.pluginResponse);
      mockCB.verify();
    });

    it('should try to verify with local server', function(){
      plugin.login();
      expect(stubNet.calledOnce).to.be.true;
    });

    it('should globally authenticate us', function(){
      plugin.login();
      expect(ssNew.isAuthed()).to.be.true;
    });

    it('should exist in the authedSources() returning array', function(){
      plugin.login();
      expect(ssNew.user.authedSources()).to.include(_this.pluginName);
    });

    it('should return the UDO as provided by the plugin', function(){
      plugin.login();
      expect(plugin.getUser()).to.deep.equal(_this.pluginUDO);
    });

  });
};


/**
 * plugin events emitted during login.
 *
 * Execute these tests after you have properly stubbed or mocked
 * the payload of the plugin's login method. For every test run it
 * should authenticate us with the UDO provided as param in this method.
 *
 *
 */
ssd.test.userAuth.genIface.prototype.loginEvents = function() {
  var _this = this;
      ssNew,
      plugin,
      stubNet,
      ev = ssd.test.fixtures.event.user;

  describe('Events emitted during the login operation. Plugin: ' + _this.pluginName, function(){

    beforeEach(function(done) {
      ssNew = new ss();
      plugin = ssNew.user[_this.pluginPathname];
      stubNet = sinon.stub(ssNew.net, 'sync');
      stubNet.yields(fixtures.userOne);
      _this.beforeEach();
      ssNew(done);
    });

    afterEach(function() {
      stubNet.restore();
      _this.afterEach();
    });


    it('should emit the extAuthChange event', function(done){
      ssNew.listen(ev.EXT_AUTH_CHANGE, function(eventObj) {
        expect(eventObj.source).to.be.equal(_this.pluginName);
        expect(eventObj.authStatus).to.be.equal(true);
        done();
      });
      plugin.login();
    });
    it('should stop authentication if false is returned on extAuthChange', function(done){});
    it('should emit extAuthChange before any other auth event', function(done){});


    it('should emit a beforeLocalAuth event', function(done){});
    it('should stop auth if false is returned on beforeLocalAuth event', function(done){});
    it('should emit an authResponse event', function(done){});

    // use all existing on-auth events that from login tests.

  });

};
