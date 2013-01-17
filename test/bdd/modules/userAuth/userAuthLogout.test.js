goog.provide('ssd.test.userAuth.logout');

goog.require('ssd.test.fixture.userOne');
goog.require('ssd.test.fixture.event');


describe('User Auth Module :: Logging out', function () {
  var ssNew;
  var stub;
  var userFix = ssd.test.fixture.userOne;
  var userEvent = ssd.test.fixture.event.user;
  var stubResponse = {status: true};
  beforeEach(function() {
    ssNew = new ss();
    ssNew();
    ssNew.user.auth(userFix);
    stub = sinon.stub(ssNew.net, 'sync');
    stub.yields(stubResponse);
  });
  afterEach(function() {
    stub.restore();
  });

  it('should perform a logout', function(){
    ssNew.user.logout();
    expect(stub.calledOnce).to.be.true;
    expect(ssNew.isAuthed()).to.be.false;
  });

  it('should leave no traces of data when logging out', function(){
    expect(ssNew.user('id')).to.equal(userFix.id);
    ssNew.user.logout();
    expect(ssNew.isAuthed()).to.be.false;
    expect(ssNew.user('id')).to.not.exist;

  });

  it('should have a callback when logging out', function(done){
    ssNew.user.logout(function(status){
      expect(status).to.be.true;
      expect(stub.calledOnce).to.be.true;
      expect(ssNew.isAuthed()).to.be.false;
      done();
    });
  });

  it('should trigger the AUTH_CHANGE event', function(done){
    ssNew.listen(userEvent.AUTH_CHANGE, function(eventObj){
      expect(eventObj.authStatus).to.be.false;
      expect(ssNew.isAuthed()).to.be.false;
      done();
    });
    ssNew.user.logout();
  });


  it('should trigger the BEFORE_LOCAL_AUTH event', function(done){
    ssNew.listen(userEvent.BEFORE_LOCAL_AUTH, function(eventObj){
      expect(stub.called).to.be.false;
    });

    ssNew.user.logout(function(){
      expect(stub.calledOnce).to.be.true;
      expect(ssNew.isAuthed()).to.be.false;
      done();
    });
  });

  it('should cancel login if we return false at the BEFORE_LOCAL_AUTH event', function(done){
    ssNew.listen(userEvent.BEFORE_LOCAL_AUTH, function(eventObj){
      return false;
    });
    ssNew.user.logout(function(status, errorCode, errorMessage){
      expect(stub.called).to.be.false;
      expect(ssNew.isAuthed()).to.be.true;
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
      expect(eventObj.response).to.deep.equal(stubResponse);
      expect(ssNew.isAuthed()).to.be.true;
      done();
    });
    ssNew.user.logout();
  });

  it('should prevent login if we return false at the BEFORE_AUTH_RESPONSE event', function(done){
    ssNew.listen(userEvent.BEFORE_AUTH_RESPONSE, function(eventObj){
      return false;
    });
    ssNew.user.logout(function(status, errorCode, errorMessage){
      expect(stub.calledOnce).to.be.true;
      expect(ssNew.isAuthed()).to.be.true;
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
      expect(eventObj.authStatus).to.be.false;
      // UDO
      expect(eventObj.user).to.not.exist;
      // response object
      expect(eventObj.response).to.deep.equal(stubResponse);
      expect(ssNew.isAuthed()).to.be.false;
      done();
    });
    ssNew.user.logout();
  });










});