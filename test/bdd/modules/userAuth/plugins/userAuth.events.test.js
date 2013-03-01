goog.provide('ssd.test.userAuth.login.events');

/**
 * [events description]
 * @param  {string} loginTriggerNS The namespace to the function that will
 *   trigger the auth process. Ok lame but it works.
 * @param  {*=} opt_params     parameters to invoke the auth trigger with.
 */
ssd.test.userAuth.login.events = function( loginTriggerNS, opt_params ) {

  var ssNew,
      stubNet,
      loginTrigger;

  describe( 'Basic login events', function(){
    beforeEach( function() {
      ssNew = new ss();
      ssNew();
      stubNet = sinon.stub( ssNew.ajax, 'send' );
      stubNet.yields( userFix );
      if ( opt_params ) {
        loginTrigger = goog.partial( ssNew.user[loginTriggerNS], opt_params );
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

        // error checks
        expect( err.code ).to.equal( errorCodes.gen.CANCEL_BY_EVENT );
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

        expect( err.code ).to.equal( errorCodes.gen.CANCEL_BY_EVENT );
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

      });

      loginTrigger( function( err, authState, user, response ){

        expect( stubNet ).to.deep.equal( funnyData );

        done();

      });


    });

    it( 'should trigger the BEFORE_AUTH_RESPONSE event', function( done ){
      ssNew.listen( userEvent.BEFORE_AUTH_RESPONSE, function( eventObj ){
        expect( stubNet.calledOnce ).to.be.true;
        expect( ssNew.isAuthed() ).to.be.false;
        done();
      });
      loginTrigger();
    });

    it( 'should prevent login if we return false at the BEFORE_AUTH_RESPONSE event', function( done ){
      ssNew.listen( userEvent.BEFORE_AUTH_RESPONSE, function( eventObj ){
        return false;
      });
      loginTrigger( function( err, authState, user, response ){
        expect( stubNet.calledOnce ).to.be.true;
        expect( ssNew.isAuthed() ).to.be.false;
        expect( status ).to.be.false;

        expect( err.code ).to.equal( errorCodes.gen.CANCEL_BY_EVENT );
        done();
      });
    });

    it( 'should trigger the AUTH_RESPONSE event', function( done ){
      ssNew.listen( userEvent.AUTH_RESPONSE, function( eventObj ){
        expect( stubNet.calledOnce ).to.be.true;
        // network operation
        expect( eventObj.status ).to.be.true;
        // user authed
        expect( eventObj.authState ).to.be.true;
        // UDO
        expect( eventObj.user ).to.deep.equal( userFix );
        // response object
        expect( eventObj.response ).to.deep.equal( userFix );
        expect( ssNew.isAuthed() ).to.be.true;
        done();
      });
      loginTrigger();
    });
  });
};
