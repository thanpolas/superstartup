goog.provide('ssd.test.userAuth.login.events');

goog.require('ssd.test.userAuth.login.events');
goog.require('ssd.test.mock.net');
goog.require('ssd.test.fixture.userOne');
goog.require('ssd.test.fixture.event');
goog.require('ssd.test.fixture.errorCodes');

/**
 * [events description]
 * @param  {string} loginTrigger The namespace to the function that will
 *   trigger the auth process. Ok lame but it works.
 */
ssd.test.userAuth.login.events = function( loginTrigger ) {

  var stubNet,
      userFix = ssd.test.fixture.userOne,
      userEvent = ssd.test.fixture.event.user,
      errorCodes = ssd.test.fixture.errorCodes;

  describe( 'Basic login events', function(){
    beforeEach( function(done) {
      if (ss.sync.send.id) {
        ss.sync.send.restore();
      }
      stubNet = sinon.stub( ss.sync, 'send' );
      stubNet.returns( ss._getResponse( userFix ) );

      ss(done);
    });

    afterEach( function() {
      stubNet.restore();
      ss.removeAllListeners();
      ss.user.deAuth();
    });

    it( 'should trigger the AUTH_CHANGE event', function(){
      var spy = sinon.spy();
      ss.listen( userEvent.AUTH_CHANGE, spy);
      loginTrigger();
      expect( spy.calledOnce ).to.be.true;
    });

    it( 'should have an authState and be true when triggering the AUTH_CHANGE event', function(){
      var spy = sinon.spy();
      ss.listen( userEvent.AUTH_CHANGE, spy);
      loginTrigger();
      expect( spy.getCall(0).args[0].authState ).to.be.true;
    });

    it( 'should trigger the "' + userEvent.BEFORE_LOGIN + '" event',
      function( done ){
      ss.listen( userEvent.BEFORE_LOGIN, function( eventObj ){
        expect( stubNet.called ).to.be.false;
        expect( ss.isAuthed() ).to.be.false;
        done();
      });

      loginTrigger();
    });

    it( 'should cancel login if we return false at the "' +
      userEvent.BEFORE_LOGIN + '" event', function( done ){
      ss.listen( userEvent.BEFORE_LOGIN, function( eventObj ){
        return false;
      });
      loginTrigger( function( err, authState, user, response ){
        expect( stubNet.called ).to.be.false;
        expect( ss.isAuthed() ).to.be.false;
        expect( authState ).to.be.false;

        expect( err ).to.be.a('string');
        done();
      });
    });

    it( 'should cancel login if we execute preventDefault at the "' +
      userEvent.BEFORE_LOGIN + '" event', function( done ){
      ss.listen( userEvent.BEFORE_LOGIN, function( eventObj ){
        eventObj.preventDefault();
      });
      loginTrigger( function( err, authState, user, response ){
        expect( stubNet.called ).to.be.false;
        expect( ss.isAuthed() ).to.be.false;
        expect( authState ).to.be.false;

        expect( err ).to.be.a('string');
        done();
      });
    });

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

      it('should have an "authState" key, boolean, false', function() {
        expect( eventObj.authState ).to.be.a('boolean');
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
