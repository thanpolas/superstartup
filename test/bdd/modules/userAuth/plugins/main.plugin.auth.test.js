/**
 * @fileOverview The generic interface test that every
 *               auth plugin should pass
 */

goog.provide('ssd.test.userAuth.genIface');

goog.require('ssd.test.fixture.event');
goog.require('ssd.test.fixture.userOne');
goog.require('ssd.test.userAuth.login.events');
goog.require('ssd.test.mock.net');

goog.require('ssd.test.userAuth.udoPlugin');

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
  this.pluginNameSpace = params.pluginNameSpace;
  this.pluginSpace    = params.pluginSpace;
  this.hasJSAPI       = params.hasJSAPI;
  this.pluginResponse = params.pluginResponse;
  this.accessToken    = params.accessToken;
  this.pluginUDO      = params.pluginUDO;
  this.eventJSLoaded  = params.eventJSLoaded;
  this.eventInitialAuthStatus = params.eventInitialAuthStatus;
  this.loginCbArg4Type = goog.isDef(params.loginCbArg4Type) ?
    params.loginCbArg4Type : 'object';
  this.loginCbArg5Type = goog.isDef(params.loginCbArg5Type) ?
    params.loginCbArg5Type : 'object';
  this.loginCbHasUdo = goog.isDef(params.loginCbHasUdo) ?
    params.loginCbHasUdo : true;

  this.beforeEach = function(){};
  this.afterEach = function(){};
  this.afterLogin = function(){};

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
 * [setAfterEach description]
 * @param {Function} fn [description]
 */
ssd.test.userAuth.genIface.prototype.setAfterLogin = function(fn){
  this.afterLogin = fn;
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
  var plugin;

  describe('10. Proper Interface implementation for ' + _this.pluginName, function(){

    beforeEach(function() {
      plugin = ss.user[_this.pluginNameSpace];
      _this.beforeEach();
    });

    afterEach(function() {
      _this.afterEach();
    });


    it('10.0.1 should have a getSourceId() method', function(){
      expect( plugin.getSourceId ).to.be.a('function');
    });
    it('10.0.2 getSourceId() should return the plugin name', function(){
      expect( plugin.getSourceId() ).to.equal( _this.pluginName );
    });
    it('10.0.3 should have a login() method', function(){
      expect( plugin.login ).to.be.a('function');
    });
    it('10.0.4 should have a hasJSAPI() method which returns boolean', function(){
      expect( plugin.hasJSAPI() ).to.be.a.boolean;
    });
    it('10.0.5 should have a logout() method', function(){
      expect( plugin.logout ).to.be.a('function');
    });
    it('10.0.6 should have an isAuthed() method and return boolean', function(){
      expect( plugin.isAuthed ).to.be.a('function');
      expect( plugin.isAuthed() ).to.be.a('boolean');
    });
    it('10.0.7 should have a getUdo() method', function(){
      expect( plugin.getUdo ).to.be.a('function');
    });
    it('10.0.8 getUdo() should return null when not authed with the plugin',
      function(done){
      var spy = sinon.spy();
      plugin.getUdo(spy).then(function(){
        expect( spy.getCall(0).args[0] ).to.be.a('null');
        done();
      }, done).otherwise(done);
    });
    it('10.0.9 should have a getAccessToken() method', function(){
      expect( plugin.getAccessToken ).to.be.a('function');
    });
    it('10.0.10 getAccessToken() should always return null', function(){
      expect( plugin.getAccessToken() ).to.be.null;
    });
    it('10.0.11 should have a logout method', function(){
      expect( plugin.logout ).to.be.a('function');
    });
  });

  describe('10.1 Auth and deAuth methods for ' + _this.pluginName, function() {
    var udoPlugin = new ssd.test.userAuth.udoPlugin(_this);
    udoPlugin.run();
  });
};

/**
 * Basic events and initialization tests
 *
 */
ssd.test.userAuth.genIface.prototype.basicEventsInitTests = function() {
  var _this = this;

  beforeEach(function() {
    _this.beforeEach();
  });

  afterEach(function() {
    ss.removeAllListeners();
    _this.afterEach();
  });

  describe('10.2 Basic events emitted for plugin:' + _this.pluginName, function() {
    it('10.2.1 should emit the initial auth status event', function(done){
      ss.listen(_this.eventInitialAuthStatus, function(eventObj){
        expect( eventObj ).to.be.a('boolean');
        done();
      });
      ss();
    });

    if (_this.hasJSAPI) {
      it('10.2.2 should emit the JS API Loaded event', function(done){
        ss.listen(_this.eventJSLoaded, function(eventObj){
          done();
        });
        ss();
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
  var _this = this,
      plugin,
      stubNet,
      fixtures = ssd.test.fixture;

  describe('10.3 Login tests for plugin: ' + _this.pluginName, function(){

    beforeEach(function(done) {
      plugin = ss.user[_this.pluginNameSpace];
      if ( ss.sync.send.id ) { ss.sync.send.restore(); }
      stubNet = sinon.stub(ss.sync, 'send');
      stubNet.returns( ss._getResponse( fixtures.userOne ));
      ss.user.logger.shout('TEST :: Network STUBED');
      ss(done);
    });

    afterEach(function() {
      stubNet.restore();
      ss.user.deAuth();
      plugin.logout();
      ss.removeAllListeners();
    });

    describe('10.3.1 login callback tests', function() {
      var spyCB;
      beforeEach(function(done) {
        _this.beforeEach();
        _this.afterLogin();
        spyCB = sinon.spy.create('loginCB');
        plugin.login(spyCB).then(function(){
          done();
        }, done).otherwise(done);


      });
      afterEach(function() {
        _this.afterEach();
      });
      it('10.3.1.1 should have a callback', function(){
        expect(spyCB.calledOnce).to.be.true;
      });
      it('10.3.1.2 should have a callback with 5 arguments', function(){
        expect( spyCB.args[0].length ).to.equal(5);
      });
      it('10.3.1.3 should have a callback with arg1, the error message, null', function(){
        expect( spyCB.args[0][0] ).to.be.null;
      });
      it('10.3.1.4 should have a callback with arg2, authState, boolean', function(){
        expect( spyCB.args[0][1] ).to.be.a('boolean');
      });
      it('10.3.1.5 should have a callback with arg3, udo, object', function(){
        expect( spyCB.args[0][2] ).to.be.an('object');
      });
      it('10.3.1.6 should have a callback with arg4, server response raw, ' + _this.loginCbArg4Type, function(){
        expect( spyCB.args[0][3] ).to.be.an(_this.loginCbArg4Type);
      });
      it('10.3.1.7 should have a callback with arg5, third-party response raw, ' + _this.loginCbArg5Type, function(){
        expect( spyCB.args[0][4] ).to.be.an(_this.loginCbArg5Type);
      });
      if (_this.loginCbHasUdo) {
        it('10.3.1.8 should have a proper user data object provided on the callback', function(){
          expect( spyCB.getCall(0).args[2] ).to.deep.equal(fixtures.userOne);
        });
        it('10.3.1.9 should have a proper server response data object provided on the callback', function(){
          expect( spyCB.getCall(0).args[3] ).to.deep.equal(fixtures.userOne);
        });
      }
      it('10.3.1.10 should have a proper 3rd party response data object provided on the callback', function(){
        expect( spyCB.getCall(0).args[4] ).to.deep.equal(_this.pluginResponse);
      });
    });

    describe('utility methods', function() {
      var spyCB;
      beforeEach(function() {
        spyCB = sinon.spy.create('loginCB');
        _this.beforeEach();
        plugin.login(spyCB);
        _this.afterLogin();
      });
      afterEach(function() {
        _this.afterEach();
      });

      it('should return ' + _this.hasJSAPI + ' when asked if hasJSAPI()', function(){
        expect( plugin.hasJSAPI() ).to.equal(_this.hasJSAPI);
      });

      it('should verify with local server', function(){
        plugin.login();
        expect( stubNet.calledOnce === plugin.hasLocalAuth() ).to.be.true;
      });

      it('should globally authenticate us', function(){
        plugin.login();
        expect( ss.isAuthed() ).to.be.true;
      });

      it('should exist in the authedSources() returning array', function(){
        plugin.login();
        expect( ss.user.authedSources() ).to.include(_this.pluginName);
      });

      it('should return the UDO as provided by the plugin', function(){
        plugin.login();
        var spy = sinon.spy();
        plugin.getUdo( spy );
        expect( spy.getCall(0).args[0] ).to.deep.equal(_this.pluginUDO);
      });

      it('should return the Access Token of the plugin', function(){
        plugin.login();
        expect( plugin.getAccessToken() ).to.equal(
          _this.accessToken);
      });
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
  var _this = this,
      plugin = ss.user[_this.pluginNameSpace],
      stubNet,
      ev = ssd.test.fixture.event.user,
      fixtures = ssd.test.fixture;


  describe('Event tests for plugin: ' + _this.pluginName, function(){

    beforeEach(function(done) {
      ss(function(){
        _this.beforeEach();
        done();
      });
    });

    afterEach(function() {
      ss.user.deAuth();
      plugin.logout();
      ss.removeAllListeners();
      _this.afterEach();
    });


    // run the basic auth events tests
    ssd.test.userAuth.login.events( function(args) {
      var promise = ss.user[_this.pluginNameSpace].login(args);
      _this.afterLogin();
      return promise;
    }, !plugin.hasLocalAuth());

    describe('Events emitted during 3rd party login operation. Plugin: ' +
        _this.pluginName, function(){

      var spyExtAuth, spyBeforeLocal, spyBeforeResponse, spyAuthResponse,
        spyAuthChange, spyLoginCB, spyBeforeExtLogin, spyOnExtAuth;


      beforeEach(function( done ){
        if ( ss.sync.send.id ) { ss.sync.send.restore(); }
        stubNet = sinon.stub(ss.sync, 'send');
        stubNet.returns( ss._getResponse( fixtures.userOne ));

        spyExtAuth = sinon.spy.create();
        spyBeforeLocal = sinon.spy.create();
        spyBeforeResponse = sinon.spy.create();
        spyAuthResponse = sinon.spy.create();
        spyAuthChange = sinon.spy.create();
        spyLoginCB = sinon.spy.create();
        spyBeforeExtLogin = sinon.spy.create();
        spyOnExtAuth = sinon.spy.create();


        ss.listen(ev.EXT_AUTH_CHANGE, spyExtAuth);
        ss.listen(ev.BEFORE_LOGIN, spyBeforeLocal);
        ss.listen(ev.ON_LOGIN_RESPONSE, spyBeforeResponse);
        ss.listen(ev.AFTER_LOGIN_RESPONSE, spyAuthResponse);
        ss.listen(ev.AUTH_CHANGE, spyAuthChange);
        ss.listen(ev.BEFORE_EXT_LOGIN, spyBeforeExtLogin);
        ss.listen(ev.ON_EXT_OAUTH, spyOnExtAuth);

        plugin.login(done);

        _this.afterLogin();
      });

      afterEach(function() {
        stubNet.restore();
        ss.removeAllListeners();
      });

      it( 'should trigger the "' + ev.BEFORE_EXT_LOGIN + '" event', function(){
        expect( spyBeforeExtLogin.calledOnce ).to.be.true;
      });
      it( 'should trigger the "' + ev.ON_EXT_OAUTH + '" event', function(){
        expect( spyOnExtAuth.calledOnce ).to.be.true;
      });
      it('should emit the "' + ev.EXT_AUTH_CHANGE + '" event', function() {
        expect( spyExtAuth.calledOnce        ).to.be.true;
      });
      it('should emit the "' + ev.BEFORE_LOGIN + '" event: ' + plugin.hasLocalAuth(), function() {
        expect( spyBeforeLocal.calledOnce === plugin.hasLocalAuth() ).to.be.true;
      });
      it('should emit the "' + ev.ON_LOGIN_RESPONSE + '" event: ' + plugin.hasLocalAuth(), function() {
        expect( spyBeforeResponse.calledOnce === plugin.hasLocalAuth() ).to.be.true;
      });
      it('should emit the "' + ev.AFTER_LOGIN_RESPONSE + '" event: ' + plugin.hasLocalAuth(), function() {
        expect( spyAuthResponse.calledOnce === plugin.hasLocalAuth()   ).to.be.true;
      });
      it('should emit the "' + ev.AUTH_CHANGE + '" event', function() {
        expect( spyAuthChange.calledOnce     ).to.be.true;
      });

      it('should emit "' + ev.BEFORE_EXT_LOGIN + '" before "' + ev.ON_EXT_OAUTH + '"', function() {
        expect( spyBeforeExtLogin.calledBefore(        spyOnExtAuth    )).to.be.true;
      });
      it('should emit "' + ev.ON_EXT_OAUTH + '" before "user.extAuthChange"', function() {
        expect( spyOnExtAuth.calledBefore(        spyExtAuth    )).to.be.true;
      });
      if (plugin.hasLocalAuth()) {
        it('should emit "user.extAuthChange" before "user.beforeLogin"', function() {
          expect( spyExtAuth.calledBefore(        spyBeforeLocal    )).to.be.true;
        });
        it('should emit "user.beforeLogin" before "user.onLoginResponse"', function() {
          expect( spyBeforeLocal.calledBefore(    spyBeforeResponse )).to.be.true;
        });
        it('should emit "user.onLoginResponse" before "user.afterLoginResponse"', function() {
          expect( spyBeforeResponse.calledBefore( spyAuthResponse   )).to.be.true;
        });
        it('should emit "user.afterLoginResponse" before "user.authChange"', function() {
          expect( spyAuthResponse.calledBefore(   spyAuthChange     )).to.be.true;
        });
      } else {
        it('should emit "user.extAuthChange" before "user.authChange"', function() {
          expect( spyExtAuth.calledBefore(        spyAuthChange    )).to.be.true;
        });
      }
      it('should provide proper data on the extAuthChange event', function(){
        var eventObj = spyExtAuth.getCall(0).args[0];
        expect( eventObj.source ).to.be.equal( _this.pluginName );
        expect( eventObj.authStatePlugin ).to.be.true;
        expect( eventObj.authState ).to.be.false;
        expect( eventObj.responsePluginRaw ).to.deep.equal( _this.pluginResponse );
      });
    });

    describe('Stop authentication if false is returned on "' +
      ev.EXT_AUTH_CHANGE + '" event. Plugin: ' + _this.pluginName, function() {
      var spyBeforeLocal, spyBeforeResponse, spyAuthResponse, spyAuthChange;

      beforeEach(function(done){
        if ( ss.sync.send.id ) { ss.sync.send.restore(); }
        stubNet = sinon.stub(ss.sync, 'send');
        stubNet.returns( ss._getResponse( fixtures.userOne ));

        ss.listen(ev.EXT_AUTH_CHANGE, function(eventObj) {
          return false;
        });
        spyBeforeLocal =  sinon.spy.create(),
        spyBeforeResponse =   sinon.spy.create(),
        spyAuthResponse =     sinon.spy.create(),
        spyAuthChange =       sinon.spy.create();

        ss.listen(ev.BEFORE_LOGIN, spyBeforeLocal);
        ss.listen(ev.ON_LOGIN_RESPONSE, spyBeforeResponse);
        ss.listen(ev.AFTER_LOGIN_RESPONSE, spyAuthResponse);
        ss.listen(ev.AUTH_CHANGE, spyAuthChange);

        plugin.login(function(){});
        _this.afterLogin();
        done();


      });

      afterEach(function() {
        stubNet.restore();
        ss.removeAllListeners();
      });


      if (plugin.hasLocalAuth()) {
        it('should not emmit the "' + ev.BEFORE_LOGIN + '" event', function(){
          expect( spyBeforeLocal.called    ).to.be.false;
        });
        it('should not emmit the "' + ev.ON_LOGIN_RESPONSE + '" event', function(){
          expect( spyBeforeResponse.called ).to.be.false;
        });
        it('should not emmit the "' + ev.AFTER_LOGIN_RESPONSE + '" event', function(){
          expect( spyAuthResponse.called   ).to.be.false;
        });
      }
      it('should not emmit the "' + ev.AUTH_CHANGE + '" event', function(){
        expect( spyAuthChange.called     ).to.be.false;
      });
      it('should not be globally authed', function() {
        expect( ss.isAuthed() ).to.be.false;
      });
      it('the plugin should not be authed', function() {
        expect( plugin.isAuthed() ).to.be.true;
      });

    });
  });
};
