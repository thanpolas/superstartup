goog.provide( 'ssd.test.userAuth.login' );

goog.require('ssd.test.userAuth.login.events');
goog.require('ssd.test.mock.net');
goog.require('ssd.test.fixture.userOne');
goog.require('ssd.test.fixture.event');
goog.require('ssd.test.fixture.errorCodes');
goog.require('goog.dom');

describe( 'User Auth Module :: Login', function () {
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

  /**
   * Login tests that need to be performed.
   * Each time a different kind of element will be passed.
   *
   * @param  {[type]} $element [description]
   * @param  {[type]} $element [description]
   * @param  {jQuery|Object|Element} $element The element to work with
   */
  function loginTests( $element ) {
    describe( 'login operations', function() {
      var sillyme = false;

      beforeEach( function() {
        if (ss.sync.send.id) {
          ss.sync.send.restore();
        }
        stub = sinon.stub( ss.sync, 'send' );
        stub.yields( ssd.test.mock.net.getResponse( userFix ));
        sillyme = true;
      });
      afterEach( function() {
        ss.user.deAuth();
        stub.restore();
        ss.removeAllListeners();
      });

      it( 'should call ssd.ajax once', function(){
        ss.user.login( $element );
        expect( stub.calledOnce ).to.be.true;
      });

      it( 'should login with provided argument', function(){
        ss.user.login( $element );
        expect( ss.isAuthed() ).to.be.true;
      });


      it( 'login passes expected name/value pairs ', function(){
        ss.user.login( $element );
        expect( stub.getCall( 0 ).args[3] ).to.deep.equal( userLoginData );
      });

      it( 'should have a callback with authState', function( done ){
        ss.user.login( $element, function( err, authState, user, response ){
          expect( err ).to.be.null;
          expect( authState ).to.be.true;
          done();
        });
      });

      it( 'should have a callback with the UDO', function( done ){
        ss.user.login( $element, function( err, authState, udo, response ){
          expect( udo ).to.deep.equal( userFix );
          done();
        });
      });

      it( 'should have a callback with the complete response from the server', function( done ){
        ss.user.login( $element, function( err, authState, udo, response ){
          expect( udo ).to.deep.equal( userFix );
          done();
        });
      });


      it( 'should provide the data to be sent when the BEFORE_LOGIN event triggers',
        function( done ){
        ss.listen( userEvent.BEFORE_LOGIN, function( eventObj ){
          expect( stub.called ).to.be.false;
          expect( eventObj.data ).to.deep.equal( userLoginData );
          done();
        });

        ss.user.login( $element, function(){
          expect( ss.isAuthed() ).to.be.true;
        });
      });
    });
  }


  /**
   * DOM FORM type of login tests
   * @param  {jQuery|element} $element [description]
   */
  function loginFormTests( $element ){
    describe('DOM Form type login tests', function() {
      beforeEach(function() {
        ss.deAuth();
      });
      it( 'should use the URL that exists in the FORM', function(){
        ss.user.login( $element );
        expect( stub.getCall( 0 ).args[0] ).to.equal( formUrl );
      });
      it( 'should use the method that exists in the FORM', function(){
        ss.user.login( $element );
        expect( stub.getCall( 0 ).args[2] ).to.equal( formMethod );
      });
    });
  }

  describe( 'Basic login operation with Object Literal', function(){
    loginTests( userLoginData );
    ssd.test.userAuth.login.events( 'login', userLoginData );
  });

  // describe( 'Login from a DOM Form using jQuery', function(){
  //   loginTests( $( '#login' ));
  //   ssd.test.userAuth.login.events( 'login', $( '#login' ));
  // });

  // describe( 'Login from a DOM Form using DOM Element', function(){
  //   loginTests( goog.dom.getElement( 'login' ));
  //   ssd.test.userAuth.login.events( 'login', goog.dom.getElement( 'login' ));
  // });
});
