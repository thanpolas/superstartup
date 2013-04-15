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
  describe('12. udo & auth / deAuth plugin tests', function() {
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

    describe('12.0 Perform auth / deauth method tests for plugin', function(){
      it('12.0.1 should not be authed', function() {
        expect( ss.isAuthed() ).to.be.false;
      });

      it('12.0.2 should have an auth method', function() {
        expect( _this.plugin.auth ).to.be.a('function');
      });
      it('12.0.3 should have a deAuth method', function() {
        expect( _this.plugin.deAuth ).to.be.a('function');
      });
      it('12.0.4 should authenticate globaly', function(done) {
        _this.plugin.auth().then(function(){
          expect( ss.isAuthed() ).to.be.true;
          done();
        }, done).otherwise(done);
      });
      it('12.0.5 should de-authenticate globaly', function(done) {
        _this.plugin.deAuth().then(function(){
          expect( ss.isAuthed() ).to.be.false;
          done();
        }, done).otherwise(done);
      });
    });
  });
};
