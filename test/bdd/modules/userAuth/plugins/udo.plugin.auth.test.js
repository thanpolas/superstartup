goog.provide('ssd.test.userAuth.udoPlugin');

goog.require('ssd.test.fixture.userOne');

/**
 * [udoPlugin description]
 * @param  {ssd.test.userAuth.getIface} mainInst [description]
 * @constructor
 */
ssd.test.userAuth.udoPlugin = function( mainInst ) {
  this.plugin = ss.user[mainInst.pluginNameSpace];
  this.pluginUDO      = mainInst.pluginUDO;
  this.beforeEach = mainInst.beforeEach;
  this.afterEach = mainInst.afterEach;
  this.afterLogin = mainInst.afterLogin;

};


/**
 * [run description]
 * @return {[type]} [description]
 */
ssd.test.userAuth.udoPlugin.prototype.run = function() {
  var _this = this;
  var stubNet;
  describe('udo & auth / deAuth plugin tests', function() {
    beforeEach(function(done) {
      if ( ss.sync.send.id ) { ss.sync.send.restore(); }
      ss.user.deAuth();
      stubNet = sinon.stub(ss.sync, 'send');
      stubNet.returns( ss._getResponse( ssd.test.fixture.userOne ));
      ss(done);
      _this.beforeEach();
    });

    afterEach(function() {
      stubNet.restore();
      ss.removeAllListeners();
      _this.afterEach();
    });

    describe('Perform auth / deauth method tests for plugin', function(){
      it('should not be authed', function() {
        expect( ss.isAuthed() ).to.be.false;
      });

      it('should have an auth method', function() {
        expect( _this.plugin.auth ).to.be.a('function');
      });
      it('should have a deAuth method', function() {
        expect( _this.plugin.deAuth ).to.be.a('function');
      });
      it('should authenticate globaly', function() {
        _this.plugin.auth();
        expect( ss.isAuthed() ).to.be.true;
      });
      it('should de-authenticate globaly', function() {
        _this.plugin.deAuth();
        expect( ss.isAuthed() ).to.be.false;
      });
    });
  });
};
