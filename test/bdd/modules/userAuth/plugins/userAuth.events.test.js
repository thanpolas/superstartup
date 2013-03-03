goog.provide('ssd.test.userAuth.login.events');

goog.require('ssd.test.userAuth.login.events');
goog.require('goog.test.mock.net');
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

  var ssNew,
      stubNet,
      userFix = ssd.test.fixture.userOne,
      userEvent = ssd.test.fixture.event.user,
      errorCodes = ssd.test.fixture.errorCodes,
      loginTrigger;


  describe( 'Basic login events', function(){
    beforeEach( function() {
      ssNew = new ss();
      ssNew();
      stubNet = sinon.stub( ssNew.ajax, 'send' );
      stubNet.yields( goog.test.mock.net.getResponse( userFix ) );
      if ( optParams ) {
        loginTrigger = goog.partial( ssNew.user[loginTriggerNS], optParams );
      } else {
        loginTrigger = ssNew.user[loginTriggerNS];
      }

    });

    afterEach( function() {
      stubNet.restore();
    });

    it( 'should trigger the AUTH_CHANGE event', function( done ){

      ssNew.listen( userEvent.AUTH_CHANGE, function( eventObj ){
        expect( eventObj.authState ).to.be.true;
        expect( ssNew.isAuthed() ).to.be.true;
        done();
      });

      loginTrigger();
    });

    it( 'should trigger the BEFORE_LOCAL_AUTH event', function( done ){
      ssNew.listen( userEvent.BEFORE_LOCAL_AUTH, function( eventObj ){
        expect( stubNet.called ).to.be.false;
        expect( ssNew.isAuthed() ).to.be.false;
        done();
      });

      loginTrigger();
    });

    it( 'should cancel login if we return false at the BEFORE_LOCAL_AUTH event', function( done ){
      ssNew.listen( userEvent.BEFORE_LOCAL_AUTH, function( eventObj ){
        return false;
      });
      loginTrigger( function( err, authState, user, response ){
        expect( stubNet.called ).to.be.false;
        expect( ssNew.isAuthed() ).to.be.false;
        expect( authState ).to.be.false;

        expect( err ).to.be.a('string');
        done();
      });
    });

    it( 'should cancel login if we execute preventDefault at the BEFORE_LOCAL_AUTH event', function( done ){
      ssNew.listen( userEvent.BEFORE_LOCAL_AUTH, function( eventObj ){
        eventObj.preventDefault();
      });
      loginTrigger( function( err, authState, user, response ){
        expect( stubNet.called ).to.be.false;
        expect( ssNew.isAuthed() ).to.be.false;
        expect( authState ).to.be.false;

        expect( err ).to.be.a('string');
        done();
      });
    });

    it('should be able to change data sent to the server when BEFORE_LOCAL_AUTH triggers',
      function( done ) {

      var funnyData = {
        one: 1,
        cow: 'cow',
        gangnam: ['style', 42]
      };

      ssNew.listen( userEvent.BEFORE_LOCAL_AUTH, function( eventObj ){
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

    it( 'should trigger the ON_AUTH_RESPONSE event', function( done ){
      ssNew.listen( userEvent.ON_AUTH_RESPONSE, function( eventObj ){
        expect( stubNet.calledOnce ).to.be.true;
        expect( ssNew.isAuthed() ).to.be.false;
        done();
      });
      loginTrigger();
    });

    it( 'should prevent login if we return false at the ON_AUTH_RESPONSE event', function( done ){
      ssNew.listen( userEvent.ON_AUTH_RESPONSE, function( eventObj ){
        return false;
      });
      loginTrigger( function( err, authState, user, response ){
        expect( stubNet.calledOnce ).to.be.true;
        expect( ssNew.isAuthed() ).to.be.false;
        expect( authState ).to.be.false;

        expect( err ).to.be.a('string');
        done();
      });
    });

    it( 'should trigger the AFTER_AUTH_RESPONSE event', function( done ){
      ssNew.listen( userEvent.AFTER_AUTH_RESPONSE, function( eventObj ){
        expect( stubNet.calledOnce ).to.be.true;

        // network operation
        expect( eventObj.ajaxStatus ).to.be.true;

        // user authed
        expect( eventObj.authState ).to.be.true;

        // UDO
        expect( eventObj.udo ).to.deep.equal( userFix );

        // response object
        expect( eventObj.responseRaw ).to.deep.equal( JSON.stringify(userFix) );

        expect( ssNew.isAuthed() ).to.be.true;
        done();
      });
      loginTrigger();
    });
  });
};
