goog.provide( 'ssd.test.userAuth.login' );

goog.require( 'ssd.test.fixture.userOne' );
goog.require( 'ssd.test.fixture.event' );
goog.require( 'ssd.test.fixture.errorCodes' );
goog.require( 'goog.dom' );

describe( 'User Auth Module :: Login', function () {
  var ssNew;
  var stub;
  var userFix = ssd.test.fixture.userOne;
  var userEvent = ssd.test.fixture.event.user;
  var errorCodes = ssd.test.fixture.errorCodes;
  var formUrl = '/user/auth';
  var formMethod = 'POST';

  // The form fields and their values as they exist in
  // the DOM
  var userLoginData = {
    username: 'thanpolas',
    password: 'passpass',
    remember: '1'
  };


  beforeEach( function() {
    ssNew = new ss();
    ssNew();
    stub = sinon.stub( ssNew.net, 'sync' );
    stub.yields( userFix );
  });
  afterEach( function() {
    stub.restore();
  });

  /**
   * Login tests that need to be performed.
   * Each time a different kind of element will be passed.
   *
   * @param  {jQuery|Object|Element} $element The element to work with
   */
  function loginTests( $element ) {
    it( 'should auth with provided argument', function(){
      ssNew.user.login( $element );
      expect( stub.calledOnce ).to.be.true;
      expect( ssNew.isAuthed() ).to.be.true;
    });


    it( 'login passes expected name/value pairs ', function(){
      ssNew.user.login( $element );
      expect( stub.getCall( 0 ).args[3] ).to.deep.equal( userLoginData );
    });

    it( 'login results in correct UDO being propagated', function(){
      ssNew.user.login( $element );
      expect( ssNew.user ).to.deep.equal( userFix );
    });

    it( 'should have a callback with authState', function( done ){
      ssNew.user.login( $element, function( err, authState, user, response ){
        expect( err ).to.be.undefined;
        expect( authState ).to.be.true;
        done();
      });
    });

    it( 'should have a callback with the UDO', function( done ){
      ssNew.user.login( $element, function( err, authState, user, response ){
        expect( user ).to.deep.equal( userFix );
        done();
      });
    });

    it( 'should have a callback with the complete response from the server', function( done ){
      ssNew.user.login( $element, function( err, authState, user, response ){
        expect( response ).to.deep.equal( userFix );
        done();
      });
    });


    it( 'should provide the data to be sent when the BEFORE_LOCAL_AUTH event triggers',
      function( done ){
      ssNew.listen( userEvent.BEFORE_LOCAL_AUTH, function( eventObj ){
        expect( stubNet.called ).to.be.false;
        expect( eventObj.data ).to.deep.equal( userLoginData );
      });

      ssNew.user.login( $element, function(){
        expect( ssNew.isAuthed() ).to.be.true;
        done();
      });
    });

  }

  /**
   * DOM FORM type of login tests
   * @param  {jQuery|element} $element [description]
   */
  function loginFormTests( $element ){
    it( 'should use the URL that exists in the FORM', function(){
      ssNew.user.login( $element );
      expect( stub.getCall( 0 ).args[0] ).to.equal( formUrl );
    });
    it( 'should use the method that exists in the FORM', function(){
      ssNew.user.login( $element );
      expect( stub.getCall( 0 ).args[2] ).to.equal( formMethod );
    });

  }

  describe( 'Basic login operation with Object Literal', function(){
    loginTests( userLoginData );
    ssd.test.userAuth.login.events( 'login', userLoginData );

  describe( 'Login from a DOM Form using jQuery', function(){
    loginTests( $( '#login' ));
    ssd.test.userAuth.login.events( 'login', $( '#login' ));
  });

  describe( 'Login from a DOM Form using DOM Element', function(){
    loginTests( goog.dom.getElement( 'login' ));
    ssd.test.userAuth.login.events( 'login', goog.dom.getElement( 'login' ));
  });
});


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
      stubNet = sinon.stub( ssNew.net, 'sync' );
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
