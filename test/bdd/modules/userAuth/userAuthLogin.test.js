goog.provide('ssd.test.userAuth.login');

goog.require('ssd.test.fixture.userOne');
goog.require('ssd.test.fixture.event');
goog.require('ssd.test.fixture.errorCodes');
goog.require('goog.dom');

describe('User Auth Module :: Login', function () {
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


  beforeEach(function() {
    ssNew = new ss();
    ssNew();
    stub = sinon.stub(ssNew.net, 'sync');
    stub.yields(userFix);
  });
  afterEach(function() {
    stub.restore();
  });

  /**
   * Login tests that need to be performed.
   * Each time a different kind of element will be passed.
   *
   * @param  {jQuery|Object|Element} $element The element to work with
   */
  function loginTests($element) {
    it('should auth with provided argument', function(){
      ssNew.user.login($element);
      expect(stub.calledOnce).to.be.true;
      expect(ssNew.isAuthed()).to.be.true;
    });


    it('login passes expected name/value pairs ', function(){
      ssNew.user.login($element);
      expect(stub.getCall(0).args[3]).to.deep.equal(userLoginData);
    });

    it('login results in correct UDO being propagated', function(){
      ssNew.user.login($element);
      expect(ssNew.user).to.deep.equal(userFix);
    });

    it('should have a callback with status', function(done){
      ssNew.user.login($element, function(status, user, result){
        expect(status).to.be.true;
        done();
      });
    });

    it('should have a callback with the UDO', function(done){
      ssNew.user.login($element, function(status, user, result){
        expect(user).to.deep.equal(userFix);
        done();
      });
    });

    it('should have a callback with the complete result data object', function(done){
      ssNew.user.login($element, function(status, user, result){
        expect(result).to.deep.equal(userFix);
        done();
      });
    });

    it('should trigger the AUTH_CHANGE event', function(done){
      ssNew.listen(userEvent.AUTH_CHANGE, function(eventObj){
        expect(eventObj.authStatus).to.be.true;
        expect(ssNew.isAuthed()).to.be.true;
        done();
      });
      ssNew.user.login($element);
    });

    it('should trigger the BEFORE_LOCAL_AUTH event', function(done){
      ssNew.listen(userEvent.BEFORE_LOCAL_AUTH, function(eventObj){
        expect(stub.called).to.be.false;
        expect(eventObj.data).to.deep.equal(userLoginData);
      });

      ssNew.user.login($element, function(){
        expect(ssNew.isAuthed()).to.be.true;
        done();
      });
    });

    it('should cancel login if we return false at the BEFORE_LOCAL_AUTH event', function(done){
      ssNew.listen(userEvent.BEFORE_LOCAL_AUTH, function(eventObj){
        return false;
      });
      ssNew.user.login($element, function(status, errorCode, errorMessage){
        expect(stub.called).to.be.false;
        expect(ssNew.isAuthed()).to.be.false;
        expect(status).to.be.false;
        expect(errorCode).to.equal(errorCodes.gen.CANCEL_BY_EVENT);
        expect(errorMessage).to.be.a('string');
        done();
      });
    });
    it('should cancel login if we execute preventDefault at the BEFORE_LOCAL_AUTH event', function(done){
      ssNew.listen(userEvent.BEFORE_LOCAL_AUTH, function(eventObj){
        eventObj.preventDefault();
      });
      ssNew.user.login($element, function(status, errorCode, errorMessage){
        expect(stub.called).to.be.false;
        expect(ssNew.isAuthed()).to.be.false;
        expect(status).to.be.false;
        expect(errorCode).to.equal(errorCodes.gen.CANCEL_BY_EVENT);
        expect(errorMessage).to.be.a('string');
        done();
      });
    });

    it('should trigger the BEFORE_AUTH_RESPONSE event', function(done){
      ssNew.listen(userEvent.BEFORE_AUTH_RESPONSE, function(eventObj){
        expect(stub.calledOnce).to.be.true;
        expect(eventObj.status).to.be.true;
        expect(eventObj.response).to.deep.equal(userFix);
        expect(ssNew.isAuthed()).to.be.false;
        done();
      });
      ssNew.user.login($element);
    });

    it('should prevent login if we return false at the BEFORE_AUTH_RESPONSE event', function(done){
      ssNew.listen(userEvent.BEFORE_AUTH_RESPONSE, function(eventObj){
        return false;
      });
      ssNew.user.login($element, function(status, errorCode, errorMessage){
        expect(stub.calledOnce).to.be.true;
        expect(ssNew.isAuthed()).to.be.false;
        expect(status).to.be.false;
        expect(errorCode).to.equal(errorCodes.gen.CANCEL_BY_EVENT);
        expect(errorMessage).to.be.a('string');
        done();
      });
    });

    it('should trigger the AUTH_RESPONSE event', function(done){
      ssNew.listen(userEvent.AUTH_RESPONSE, function(eventObj){
        expect(stub.calledOnce).to.be.true;
        // network operation
        expect(eventObj.status).to.be.true;
        // user authed
        expect(eventObj.authStatus).to.be.true;
        // UDO
        expect(eventObj.user).to.deep.equal(userFix);
        // response object
        expect(eventObj.response).to.deep.equal(userFix);
        expect(ssNew.isAuthed()).to.be.true;
        done();
      });
      ssNew.user.login($element);
    });
  }

  /**
   * DOM FORM type of login tests
   * @param  {jQuery|element} $element [description]
   */
  function loginFormTests($element){
    it('should use the URL that exists in the FORM', function(){
      ssNew.user.login($element);
      expect(stub.getCall(0).args[0]).to.equal(formUrl);
    });
    it('should use the method that exists in the FORM', function(){
      ssNew.user.login($element);
      expect(stub.getCall(0).args[2]).to.equal(formMethod);
    });

  }

  describe('Basic login operation with Object Literal', function(){
    loginTests(userLoginData);
  });

  describe('Login from a DOM Form using jQuery', function(){
    loginTests($('#login'));
    loginFormTests($('#login'));
  });

  describe('Login from a DOM Form using DOM Element', function(){
    loginTests(goog.dom.getElement('login'));
    loginFormTests(goog.dom.getElement('login'));
  });
});

