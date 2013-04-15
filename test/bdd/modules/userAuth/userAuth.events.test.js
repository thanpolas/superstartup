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


  describe( '6. Basic login events', function(){
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

    describe('6.1 standard EVENTS', function() {

      var spyBeforeLocal, spyBeforeResponse, spyAuthResponse,
          spyAuthChange, spyLoginCB;


      beforeEach( function(done) {
        spyBeforeLocal = sinon.spy.create();
        spyBeforeResponse = sinon.spy.create();
        spyAuthResponse = sinon.spy.create();
        spyAuthChange = sinon.spy.create();
        spyLoginCB = sinon.spy.create();

        ss.listen(userEvent.BEFORE_LOGIN, spyBeforeLocal);
        ss.listen(userEvent.ON_LOGIN_RESPONSE, spyBeforeResponse);
        ss.listen(userEvent.AFTER_LOGIN_RESPONSE, spyAuthResponse);
        ss.listen(userEvent.AUTH_CHANGE, spyAuthChange);

        loginTrigger(spyLoginCB).ensure(done);
      });

      afterEach( function() {
      });

      it('6.1.1 should be authed', function(){
        expect( ss.isAuthed() ).to.be.true;
      });
      it('6.1.2 should trigger the "' + userEvent.AUTH_CHANGE + '" event', function(){
        expect( spyAuthChange.calledOnce ).to.be.true;
      });
      it('6.1.3 should have an authState and be true when triggering the "' +
        userEvent.AUTH_CHANGE + '" event', function(){
        expect( spyAuthChange.getCall(0).args[0].authState ).to.be.true;
      });

      if (optNoLocalLogin) {
        return;
      }

      it('6.1.4 should trigger the "' + userEvent.BEFORE_LOGIN + '" event', function(){
        expect( spyBeforeLocal.calledOnce ).to.be.true;
      });
      it('6.1.5 should emit the "' + userEvent.ON_LOGIN_RESPONSE + '" event.', function() {
        expect( spyBeforeResponse.calledOnce ).to.be.true;
      });
      it('6.1.6 should emit the "' + userEvent.AFTER_LOGIN_RESPONSE + '" event.', function() {
        expect( spyAuthResponse.calledOnce   ).to.be.true;
      });
    });

    if (optNoLocalLogin) {
      return;
    }


    var cancelEvents = function(eventName, using, cancelOp) {
      describe('6.2 Cancel operations from ' + eventName + ' event,' +
        ' using "' + using + '"', function() {

        var spyLoginCB, cbArgs;

        beforeEach( function(done) {
          cancelOp();
          spyLoginCB = sinon.spy.create();
          loginTrigger(spyLoginCB).ensure(done);

        });

        afterEach( function() {
        });

        it('6.2.1 should not be authed', function() {
          expect( ss.isAuthed() ).to.be.false;
        });
        it('6.2.2 should not call sync', function() {
          expect( stubNet.called ).to.be.false;
        });
        it('6.2.3 should have the err defined in the callback', function() {
          cbArgs = spyLoginCB.getCall(0).args;
          expect( cbArgs[0] ).to.be.a('string');
        });
        it('6.2.4 callback arg "authState" should be false', function() {
          cbArgs = spyLoginCB.getCall(0).args;
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

    describe('6.3 Advanced event operations', function() {
      it('6.3.1 should be able to change data sent to the server when "' +
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

      it('6.3.2 should trigger the "' + userEvent.ON_LOGIN_RESPONSE + '" event',
        function( done ){
        ss.listen( userEvent.ON_LOGIN_RESPONSE, function( eventObj ){
          expect( stubNet.calledOnce ).to.be.true;
          expect( ss.isAuthed() ).to.be.false;
          done();
        });
        loginTrigger();
      });

      it('6.3.3 should prevent login if we return false at the "' +
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

      it('6.3.4 should trigger the AFTER_LOGIN_RESPONSE event', function(done){
        var spy = sinon.spy();
        ss.listen( userEvent.AFTER_LOGIN_RESPONSE, spy);
        loginTrigger().then(function(){
          expect( spy.calledOnce ).to.be.true;
          done();
        }, done).otherwise(done);
      });
    });


    describe('6.4 Analyze the event object of the "' +
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

      it('6.4.1 should have an "authState" key, boolean', function() {
        expect( eventObj.authState ).to.be.a('boolean');
      });
      it('6.4.2 should have an "authState" key, false', function() {
        expect( eventObj.authState ).to.be.false;
      });

      it('6.4.3 should have a "success" key, boolean, true', function() {
        expect( eventObj.success ).to.be.a('boolean');
        expect( eventObj.success ).to.be.true;
      });
      it('6.4.4 should have an "errorMessage" key, null', function() {
        expect( eventObj.errorMessage ).to.be.null;
      });
      it('6.4.5 should have a "httpStatus" key, number, 200', function() {
        expect( eventObj.httpStatus ).to.be.a('number');
        expect( eventObj.httpStatus ).to.equal(200);
      });
      it('6.4.6 should have a "responseRaw" key, string', function() {
        expect( eventObj.responseRaw ).to.be.a('string');
      });
      it('6.4.7 should have a "responseRaw" key with the proper value', function() {
        expect( eventObj.responseRaw ).to.equal( JSON.stringify(userFix) );
      });
      it('6.4.8 should have a "udo" key, object', function() {
        expect( eventObj.udo ).to.be.an('object');
      });
      it('6.4.9 should have a "udo" key deep equal to the udo fixture', function() {
        expect( eventObj.udo ).to.deep.equal( userFix );
      });
    });
  });
};
