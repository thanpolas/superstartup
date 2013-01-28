/**
 * @fileOverview The generic interface test that every
 *               auth plugin should pass
 */

goog.provide('ssd.test.userAuth.genIface');

goog.require('ssd.test.fixture.event');
goog.require('ssd.test.fixture.userOne');

/**
 * @param  {string} pluginSpace The namespace in the JS
 *                                 object chain where the plugin
 *                                 exists. e.g. 'fb' for:
 *                                 ss.user.fb.
 * @param  {string} pluginName The canonical name of the plugin as
 *                         used inside the ss library.
 * @constructor
 */
ssd.test.userAuth.genIface = function(pluginNamespace, pluginName) {
  this.pluginName = pluginName;
  this.pluginSpace = pluginSpace;

  this.beforeEach = function(){};
  this.afterEach = function(){};
};

/**
 * [setBeforeEach description]
 * @param {Function} fn [description]
 */
ssd.test.userAuth.genIface.prototype.setBeforeEach = function(fn){
  this.beforeEach = fn;
};
/**
 * [setAfterEach description]
 * @param {Function} fn [description]
 */
ssd.test.userAuth.genIface.prototype.setAfterEach = function(fn){
  this.afterEach = fn;
};



/**
 * Perform basic tests that every third-party auth plugin
 * should pass.
 *
 *
 */
ssd.test.userAuth.genIface.prototype.basicTests = function() {

  var self = this;
  var ssNew;
  var plugin;

  describe('Proper Interface implementation for ' + self.pluginName, function(){

    beforeEach(function() {
      ssNew = new ss();
      plugin = ssNew.user[self.pluginPathname];
      self.beforeEach();
    });

    afterEach(function() {
      self.afterEach();
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
 * Login callback test.
 *
 * Run these tests on third-party auth plugins that support a
 * callback on the login method (they offer a JS API)
 *
 * Execute these tests after you have properly stubbed or mocked
 * the payload of the plugin's login method. For every test run it
 * should authenticate us with the UDO provided as param in this method.
 *
 *
 * @param {Object} pluginResponse the plugin's response data object on
 *                                successful auth operations.
 * @param {Object} pluginUDO The plugin's User Data Object
 *                            as provided by the plugin.
 */
ssd.test.userAuth.genIface.prototype.loginCallback = function(pluginResponse, pluginUDO) {
  var self = this;
  var ssNew;
  var plugin;
  var stubNet;

  describe('Plugins that support a callback on login. Plugin: ' + self.pluginName, function(){

    beforeEach(function() {
      ssNew = new ss();
      ssNew();
      plugin = ssNew.user[self.pluginPathname];
      stubNet = sinon.stub(ssNew.net, 'sync');
      stubNet.yields(fixtures.userOne);

      self.beforeEach();
    });

    afterEach(function() {
      stubNet.restore();
      self.afterEach();
    });

    it('should return true when asked if hasJSAPI()', function(){
      expect(plugin.hasJSAPI()).to.be.true;
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
      expect(mockCB.getCall(0).args[1]).to.deep.equal(pluginResponse);
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
      expect(ssNew.user.authedSources()).to.include(self.pluginName);
    });

    it('should return the UDO as provided by the plugin', function(){
      plugin.login();
      expect(plugin.getUser()).to.deep.equal(pluginUDO);
    });

  });
};


/**
 * Login callback test.
 *
 * Run these tests on third-party auth plugins that support a
 * callback on the login method (they offer a JS API)
 *
 * Execute these tests after you have properly stubbed or mocked
 * the payload of the plugin's login method. For every test run it
 * should authenticate us with the UDO provided as param in this method.
 *
 *
 * @param {Object} pluginResponse the plugin's response data object on
 *                                successful auth operations.
 * @param {Object} pluginUDO The plugin's User Data Object
 *                            as provided by the plugin.
 * @param {string} eventJSLoaded  The event triggered when the plugin's
 *                                JS API has been loaded.
 */
ssd.test.userAuth.genIface.prototype.loginEvents = function(pluginResponse,
    pluginUDO, eventJSLoaded) {
  var self = this;
  var ssNew;
  var plugin;
  var stubNet;

  describe('Events emitted during the login operation. Plugin: ' + self.pluginName, function(){

    beforeEach(function() {
      ssNew = new ss();
      plugin = ssNew.user[self.pluginPathname];
      stubNet = sinon.stub(ssNew.net, 'sync');
      stubNet.yields(fixtures.userOne);

      self.beforeEach();
    });

    afterEach(function() {
      stubNet.restore();
      self.afterEach();
    });

    it('should emit the JS API Loaded event', function(done){
      ssNew.listen(eventJSLoaded, function(eventObj){
        done();
      });
      ssNew();
    });

    it('should emit the extAuthChange event', function(done){});
    it('should stop authentication if false is returned on extAuthChange', function(done){});
    it('should emit extAuthChange before any other auth event', function(done){});


    it('should emit a beforeLocalAuth event', function(done){});
    it('should stop auth if false is returned on beforeLocalAuth event', function(done){});
    it('should emit an authResponse event', function(done){});

    // use all existing on-auth events that from login tests.

    it('should have a proper solution for initialAuthStatus events', function(){
      expect(false).to.be.true;
    });

  });

};
