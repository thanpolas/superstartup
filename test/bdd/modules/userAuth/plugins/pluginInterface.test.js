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
      expect( plugin.getSourceId ).to.be.a('function');
    });
    it('getSourceId() should return the plugin name', function(){
      expect( plugin.getSourceId() ).to.equal(pluginName);
    });
    it('should have a login() method', function(){
      expect( plugin.login ).to.be.a('function');
    });
    it('should have a hasJSAPI() method which returns boolean', function(){
      expect( plugin.hasJSAPI() ).to.be.a.boolean;
    });
    it('should have a logout() method', function(){
      expect( plugin.logout ).to.be.a('function');
    });
    it('should have an isAuthed() method and return boolean', function(){
      expect( plugin.isAuthed ).to.be.a('function');
      expect( plugin.isAuthed() ).to.be.a('boolean');
    });
    it('should have a getUser() method', function(){
      expect( plugin.getUser ).to.be.a('function');
    });
    it('getUser() should return null when not authed with the plugin', function(){
      expect( plugin.getUser() ).to.be.a('null');
    });
    it('should have a getAccessToken() method', function(){
      expect( plugin.getAccessToken ).to.be.a('function');
    });
    it('getAccessToken() should always return string', function(){
      expect( plugin.getAccessToken() ).to.be.a('string');
    });
    it('should have a logout method', function(){
      expect( plugin.logout ).to.be.a('function');
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
        expect( eventObj ).to.be.a('boolean');
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
      stubNet,
      fixtures = ssd.test.fixtures;

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
      expect( plugin.hasJSAPI() ).to.equal(_this.hasJSAPI);
    });

    it('should have a working callback', function(){
      var spyCB = sinon.spy.create('loginCB');
      plugin.login(spyCB);
      expect( spyCB.calledOnce ).to.be.true;
    });

    it('should have a callback with the proper signature', function(){
      var spyCB = sinon.spy.create('loginCB');
      plugin.login(spyCB);

      // that's the signature of the callback
      // err, authState, user, response, response3rdParty
      var args = spyCB.args;

      // the err object should be undefined
      expect( args[0] ).to.be.undefined;

      // the authState should be a boolean
      expect( args[1] ).to.be.a('boolean');

      // the user data object should be an object
      expect( args[2] ).to.be.an('object');

      // the [server]ressponse and 3rd party response should be objects
      expect( args[3] ).to.be.an('object');
      expect( args[4] ).to.be.an('object');

      // in total, 5 arguments
      expect( args.length ).to.equal(5);
    });


    it('should have a proper user data object provided on the callback', function(){
      var spyCB = sinon.spy.create('loginCB');
      plugin.login(spyCB);
      expect( spyCB.getCall(0).args[2] ).to.deep.equal(fixtures.userOne);
    });

    it('should have a proper server response data object provided on the callback', function(){
      var spyCB = sinon.spy.create('loginCB');
      plugin.login(spyCB);
      expect( spyCB.getCall(0).args[3] ).to.deep.equal(fixtures.userOne);
    });

    it('should have a proper 3rd party response data object provided on the callback', function(){
      var spyCB = sinon.spy.create('loginCB');
      plugin.login(spyCB);
      expect( spyCB.getCall(0).args[4] ).to.deep.equal(_this.pluginResponse);
    });

    it('should try to verify with local server', function(){
      plugin.login();
      expect( stubNet.calledOnce ).to.be.true;
    });

    it('should globally authenticate us', function(){
      plugin.login();
      expect( ssNew.isAuthed() ).to.be.true;
    });

    it('should exist in the authedSources() returning array', function(){
      plugin.login();
      expect( ssNew.user.authedSources() ).to.include(_this.pluginName);
    });

    it('should return the UDO as provided by the plugin', function(){
      plugin.login();
      expect( plugin.getUser() ).to.deep.equal(_this.pluginUDO);
    });

    it('should return the Access Token of the plugin', function(){
      plugin.login();
      expect( plugin.getAccessToken() ).to.equal(_this.pluginResponse.accessToken);
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
 */
ssd.test.userAuth.genIface.prototype.loginEvents = function() {
  var _this = this;
      ssNew,
      plugin,
      stubNet,
      ev = fixtures.event.user;

  // run the basic auth events tests
  ssd.test.userAuth.login.events(_this.pluginPathname + '.login');

  describe('Events emitted during 3rd party login operation. Plugin: ' +
      _this.pluginName, function(){

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

    it('should emit the following events in the following order and only once', function(done) {
      var spyExtAuth =      sinon.spy.create(),
        spyBeforeLocal =    sinon.spy.create(),
        spyBeforeResponse = sinon.spy.create(),
        spyAuthResponse =   sinon.spy.create(),
        spyAuthChange =     sinon.spy.create(),
        spyLoginCB =        sinon.spy.create();

      ssNew.listen(ev.EXT_AUTH_CHANGE, spyExtAuth);
      ssNew.listen(ev.BEFORE_LOCAL_AUTH, spyBeforeLocal);
      ssNew.listen(ev.BEFORE_AUTH_RESPONSE, spyBeforeResponse);
      ssNew.listen(ev.AUTH_RESPONSE, spyAuthResponse);
      ssNew.listen(ev.AUTH_CHANGE, spyAuthChange);

      plugin.login(spyLoginCB);

      expect( spyExtAuth.calledOnce        ).to.be.true;
      expect( spyBeforeLocal.calledOnce    ).to.be.true;
      expect( spyBeforeResponse.calledOnce ).to.be.true;
      expect( spyAuthResponse.calledOnce   ).to.be.true;
      expect( spyAuthChange.calledOnce     ).to.be.true;
      expect( spyLoginCB.calledOnce     ).to.be.true;

      expect( spyExtAuth.calledBefore(        spyBeforeLocal    )).to.be.true;
      expect( spyBeforeLocal.calledBefore(    spyBeforeResponse )).to.be.true;
      expect( spyBeforeResponse.calledBefore( spyAuthResponse   )).to.be.true;
      expect( spyAuthResponse.calledBefore(   spyAuthChange     )).to.be.true;
      expect( spyAuthChange.calledBefore(     spyLoginCB        )).to.be.true;
      expect( spyLoginCB.calledAfter(         spyAuthChange     )).to.be.true;
    });

    it('should provide proper data on the extAuthChange event', function(done){
      ssNew.listen(ev.EXT_AUTH_CHANGE, function(eventObj) {
        expect( stubNet.called ).to.be.false;
        expect( eventObj.source ).to.be.equal( _this.pluginName );
        expect( eventObj.authStatePlugin ).to.be.true;
        expect( eventObj.authState ).to.be.false;
        expect( eventObj.responsePlugin ).to.deep.equal( _this.pluginResponse );
        done();
      });

      plugin.login();
    });

    it('should stop authentication if false is returned on extAuthChange', function(done){
      ssNew.listen(ev.EXT_AUTH_CHANGE, function(eventObj) {
        return false;
      });
      var spyBeforeLocal =  sinon.spy.create(),
      spyBeforeResponse =   sinon.spy.create(),
      spyAuthResponse =     sinon.spy.create(),
      spyAuthChange =       sinon.spy.create();

      ssNew.listen(ev.BEFORE_LOCAL_AUTH, spyBeforeLocal);
      ssNew.listen(ev.BEFORE_AUTH_RESPONSE, spyBeforeResponse);
      ssNew.listen(ev.AUTH_RESPONSE, spyAuthResponse);
      ssNew.listen(ev.AUTH_CHANGE, spyAuthChange);

      plugin.login(done);

      expect( spyBeforeLocal.called    ).to.be.false;
      expect( spyBeforeResponse.called ).to.be.false;
      expect( spyAuthResponse.called   ).to.be.false;
      expect( spyAuthChange.called     ).to.be.false;

      expect( ssNew.isAuthed() ).to.be.false;
      expect( plugin.isAuthed() ).to.be.true;

    });

    it('should provide proper data on the beforeLocalAuth event', function(done){
      ssNew.listen(ev.BEFORE_LOCAL_AUTH, function( eventObj ) {
        expect( ssNew.isAuthed() ).to.be.false;
        expect( stubNet.called ).to.be.false;

        expect( eventObj.data ).to.deep.equal( {/* wtf bbq? */} );
      });

      plugin.login(done);
    });

  });

};
