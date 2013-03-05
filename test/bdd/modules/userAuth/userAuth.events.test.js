goog.provide('ssd.test.userAuth.login.events');

goog.require('ssd.test.userAuth.login.events');
goog.require('ssd.test.mock.net');
goog.require('ssd.test.fixture.userOne');
goog.require('ssd.test.fixture.event');
goog.require('ssd.test.fixture.errorCodes');

/**
 * [events description]
 * @param  {string} loginTriggerNS The namespace to the function that will
 *   trigger the auth process. Ok lame but it works.
 * @param  {*=} optParams     parameters to invoke the auth trigger with.
 */
ssd.test.userAuth.login.events = function( loginTriggerNS, optParams ) {

  var stubNet,
      userFix = ssd.test.fixture.userOne,
      userEvent = ssd.test.fixture.event.user,
      errorCodes = ssd.test.fixture.errorCodes,
      sillyme = false,
      loginTrigger;

  if ( optParams ) {
    loginTrigger = goog.partial( ss.user[loginTriggerNS], optParams );
  } else {
    loginTrigger = ss.user[loginTriggerNS];
  }

  describe( 'Basic login events', function(){
    beforeEach( function() {
      if (!ss.sync.send.id) {
        stubNet = sinon.stub( ss.sync, 'send' );
        stubNet.yields( ssd.test.mock.net.getResponse( userFix ) );
        sillyme = true;
      }
    });

    afterEach( function() {
      if (sillyme) {
        stubNet.restore();
        sillyme = false;
      }
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

    it( 'should trigger the BEFORE_LOGIN event', function( done ){
      ss.listen( userEvent.BEFORE_LOGIN, function( eventObj ){
        expect( stubNet.called ).to.be.false;
        expect( ss.isAuthed() ).to.be.false;
        done();
      });

      loginTrigger();
    });

    it( 'should cancel login if we return false at the BEFORE_LOGIN event', function( done ){
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

    it( 'should cancel login if we execute preventDefault at the BEFORE_LOGIN event', function( done ){
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

    it('should be able to change data sent to the server when BEFORE_LOGIN triggers',
      function( done ) {

      var funnyData = {
        one: 1,
        cow: 'cow',
        gangnam: ['style', 42]
      };

      ss.listen( userEvent.BEFORE_LOGIN, function( eventObj ){
        eventObj.backPipe(function(data) {
          expect( data ).to.deep.equal(optParams);
          return funnyData;
        });

      });

      loginTrigger( function( err, authState, user, response ){
        expect( stubNet.getCall( 0 ).args[3] ).to.deep.equal( funnyData );
        done();
      });
    });

    it( 'should trigger the ON_LOGIN_RESPONSE event', function( done ){
      ss.listen( userEvent.ON_LOGIN_RESPONSE, function( eventObj ){
        expect( stubNet.calledOnce ).to.be.true;
        expect( ss.isAuthed() ).to.be.false;
        done();
      });
      loginTrigger();
    });

    it( 'should prevent login if we return false at the ON_LOGIN_RESPONSE event', function( done ){
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

    it( 'should trigger the AFTER_LOGIN_RESPONSE event', function( done ){
      ss.listen( userEvent.AFTER_LOGIN_RESPONSE, function( eventObj ){
        expect( stubNet.calledOnce ).to.be.true;

        // network operation
        expect( eventObj.ajaxStatus ).to.be.true;

        // user authed
        expect( eventObj.authState ).to.be.true;

        // UDO
        expect( eventObj.udo ).to.deep.equal( userFix );

        // response object
        expect( eventObj.responseRaw ).to.deep.equal( JSON.stringify(userFix) );

        expect( ss.isAuthed() ).to.be.true;
        done();
      });
      loginTrigger();
    });
  });
};
