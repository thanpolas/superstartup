goog.provide('ssd.test.userAuth.login.events');

goog.require('ssd.test.userAuth.login.events');
goog.require('ssd.test.mock.net');
goog.require('ssd.test.fixture.userOne');
goog.require('ssd.test.fixture.event');
goog.require('ssd.test.fixture.errorCodes');

/**
 * [events description]
 * @param  {string} loginTrigger The namespace to the function that will
 * @param  {boolean} optNoLocalLogin If the loginTrigger does not produce local
 *                                   login events.
 *   trigger the auth process. Ok lame but it works.
 */
ssd.test.userAuth.login.events = function( loginTrigger, optNoLocalLogin ) {

  var stubNet,
      userFix = ssd.test.fixture.userOne,
      userEvent = ssd.test.fixture.event.user,
      errorCodes = ssd.test.fixture.errorCodes,
      spy;


  describe( 'Basic login events', function(){
    beforeEach( function(done) {
      if (ss.sync.send.id) {
        ss.sync.send.restore();
      }
      stubNet = sinon.stub( ss.sync, 'send' );
      stubNet.returns( ss._getResponse( userFix ) );
      spy = sinon.spy();
      ss(done);
    });

    afterEach( function() {
      stubNet.restore();
      ss.removeAllListeners();
      ss.user.deAuth();
    });

    describe('standard EVENTS', function() {

      var spyBeforeLocal, spyBeforeResponse, spyAuthResponse,
          spyAuthChange, spyLoginCB;


      beforeEach( function() {
        spyBeforeLocal = sinon.spy.create();
        spyBeforeResponse = sinon.spy.create();
        spyAuthResponse = sinon.spy.create();
        spyAuthChange = sinon.spy.create();
        spyLoginCB = sinon.spy.create();

        ss.listen(userEvent.BEFORE_LOGIN, spyBeforeLocal);
        ss.listen(userEvent.ON_LOGIN_RESPONSE, spyBeforeResponse);
        ss.listen(userEvent.AFTER_LOGIN_RESPONSE, spyAuthResponse);
        ss.listen(userEvent.AUTH_CHANGE, spyAuthChange);

        loginTrigger(spyLoginCB);
      });

      afterEach( function() {
      });

      it( 'should be authed', function(){
        expect( ss.isAuthed() ).to.be.true;
      });
      it( 'should trigger the "' + userEvent.AUTH_CHANGE + '" event', function(){
        expect( spyAuthChange.calledOnce ).to.be.true;
      });
      it( 'should have an authState and be true when triggering the "' +
        userEvent.AUTH_CHANGE + '" event', function(){
        expect( spyAuthChange.getCall(0).args[0].authState ).to.be.true;
      });

      if (optNoLocalLogin) {
        return;
      }

      it( 'should trigger the "' + userEvent.BEFORE_LOGIN + '" event', function(){
        expect( spyBeforeLocal.calledOnce ).to.be.true;
      });
      it('should emit the "' + userEvent.ON_LOGIN_RESPONSE + '" event.', function() {
        expect( spyBeforeResponse.calledOnce ).to.be.true;
      });
      it('should emit the "' + userEvent.AFTER_LOGIN_RESPONSE + '" event.', function() {
        expect( spyAuthResponse.calledOnce   ).to.be.true;
      });
    });

    if (optNoLocalLogin) {
      return;
    }


    var cancelEvents = function(eventName, using, cancelOp) {
      describe('Cancel operations from ' + eventName + ' event,' +
        ' using "' + using + '"', function() {

        var spyLoginCB, cbArgs;

        beforeEach( function() {
          cancelOp();
          spyLoginCB = sinon.spy.create();
          loginTrigger(spyLoginCB);

          cbArgs = spyLoginCB.getCall(0).args;
        });

        afterEach( function() {
        });

        it('should not be authed', function() {
          expect( ss.isAuthed() ).to.be.false;
        });
        it('should not call sync', function() {
          expect( stubNet.called ).to.be.false;
        });
        it('should have the err defined in the callback', function() {
          expect( cbArgs[0] ).to.be.a('string');
        });
        it('callback arg "authState" should be false', function() {
          expect( cbArgs[1] ).to.be.false;
        });
      });
    };

    cancelEvents(userEvent.BEFORE_LOGIN, 'return false;', function() {
      ss.listen( userEvent.BEFORE_LOGIN, function( eventObj ){
        return false;
      });
    });

    cancelEvents(userEvent.BEFORE_LOGIN, 'preventDefault();', function(){
      ss.listen( userEvent.BEFORE_LOGIN, function( eventObj ){
        eventObj.preventDefault();
      });
    });

    describe('Advanced event operations', function() {
      it('should be able to change data sent to the server when "' +
        userEvent.BEFORE_LOGIN + '" triggers',
        function( done ) {

        var funnyData = {
          one: 1,
          cow: 'cow',
          gangnam: ['style', 42]
        };
        ss.listen( userEvent.BEFORE_LOGIN, function( eventObj ){
          eventObj.backPipe(function(data) {
            return funnyData;
          });
        });

        loginTrigger( function( err, authState, user, response ){
          expect( stubNet.getCall( 0 ).args[3] ).to.deep.equal( funnyData );
          done();
        });
      });

      it( 'should trigger the "' + userEvent.ON_LOGIN_RESPONSE + '" event',
        function( done ){
        ss.listen( userEvent.ON_LOGIN_RESPONSE, function( eventObj ){
          expect( stubNet.calledOnce ).to.be.true;
          expect( ss.isAuthed() ).to.be.false;
          done();
        });
        loginTrigger();
      });

      it( 'should prevent login if we return false at the "' +
        userEvent.ON_LOGIN_RESPONSE + '" event', function( done ){
        ss.listen( userEvent.ON_LOGIN_RESPONSE, function( eventObj ){
          return false;
        });
        loginTrigger( function( err, authState, user, response ){
          expect( stubNet.calledOnce ).to.be.true;
          expect( ss.isAuthed() ).to.be.false;
          expect( authState ).to.be.false;

          expect( err ).to.be.a('string');
          done();
        });
      });

      it( 'should trigger the AFTER_LOGIN_RESPONSE event', function(){
        var spy = sinon.spy();
        ss.listen( userEvent.AFTER_LOGIN_RESPONSE, spy);
        loginTrigger();
        expect( spy.calledOnce ).to.be.true;
      });
    });


    describe('Analyze the event object of the "' +
      userEvent.AFTER_LOGIN_RESPONSE + '" event', function() {
      var spy = sinon.spy();
      var eventObj;

      beforeEach(function(done){
        ss.listen( userEvent.AFTER_LOGIN_RESPONSE, spy );
        loginTrigger().then(function(){
          eventObj = spy.getCall(0).args[0];
          done();
        });
      });

      it('should have an "authState" key, boolean', function() {
        expect( eventObj.authState ).to.be.a('boolean');
      });
      it('should have an "authState" key, false', function() {
        expect( eventObj.authState ).to.be.false;
      });

      it('should have a "success" key, boolean, true', function() {
        expect( eventObj.success ).to.be.a('boolean');
        expect( eventObj.success ).to.be.true;
      });
      it('should have an "errorMessage" key, null', function() {
        expect( eventObj.errorMessage ).to.be.null;
      });
      it('should have a "httpStatus" key, number, 200', function() {
        expect( eventObj.httpStatus ).to.be.a('number');
        expect( eventObj.httpStatus ).to.equal(200);
      });
      it('should have a "responseRaw" key, string', function() {
        expect( eventObj.responseRaw ).to.be.a('string');
      });
      it('should have a "responseRaw" key with the proper value', function() {
        expect( eventObj.responseRaw ).to.equal( JSON.stringify(userFix) );
      });
      it('should have a "udo" key, object', function() {
        expect( eventObj.udo ).to.be.an('object');
      });
      it('should have a "udo" key deep equal to the udo fixture', function() {
        expect( eventObj.udo ).to.deep.equal( userFix );
      });
    });
  });
};
