goog.provide('ssd.test.user.api');

goog.require('ssd.test.fixture.userOne');

describe('User Auth Module :: Login Logout', function () {
  var ssNew;
  var stub;
  var userMock = ssd.test.mock.userOne;

  // Use Sinon to replace superstartup's sync method
  // with a spy. This spy will also come with
  // some success data.
  beforeEach(function() {
    ssNew = new ss();
    stub = sinon.stub(ssNew.net, 'sync');
  });

  // Restor jQuery's ajax method to its
  // original state
  afterEach(function() {
    ssNew.net.sync.restore();
  });
  // the login data mock
  var userLogin = {
    username: 'superstartup',
    password: 'password'
  };

  it('should perform a login with the server using a JS Object Literal', function(){
    expect(ssNew.isAuthed()).to.not.be.true;

    // execute the net.sync cb with the mock UDO
    stub.yields(userMock);

    ssNew.user.login(userLogin);

    expect(stub.calledOnce).to.be.true;
    expect(ssNew.net.sync.alwaysCalledWithMatch(userLogin)).to.be.true;

    expect(ssNew.isAuthed()).to.be.true;
    expect(ssNew.user('id')).to.equal(userMock.id);
  });

  it('should have a callback when using login', function(done){
    // execute the net.sync cb with the mock UDO
    stub.yields(ssd.test.mock.userOne);

    ssNew.user.login(userLogin, function(status, user){
      expect(ssNew.net.sync.calledOnce).to.be.true;
      expect(status).to.be.true;
      expect(user.id).to.equal(userMock.id);
      done();
    });
  });

  it('should perform a login from a jQuery Object', function(){
    stub.yields(userMock);

    ssNew.user.login($('#login'));

    expect(ssNew.net.sync.calledOnce).to.be.true;
    expect(ssNew.net.sync.alwaysCalledWithMatch(userLogin)).to.be.true;

    expect(ssNew.isAuthed()).to.be.true;
    expect(ssNew.user('id')).to.equal(userMock.id);

  });

  it('should perform a logout', function(){
    // We don't really care what
    // the server returns when we send a logout
    // request
    stub.yields({});

    ssNew.user.auth(userMock);

    ssNew.user.logout();
    expect(ssNew.net.sync.calledOnce).to.be.true;
    expect(ssNew.isAuthed()).to.be.false;
  });

  it('should leave no traces of data when logging out', function(){
    stub.yields({});

    ssNew.user.auth(userMock);
    expect(ssNew.user('id')).to.equal(userMock.id);
    ssNew.user.logout();
    expect(ssNew.isAuthed()).to.be.false;
    expect(ssNew.user('id')).to.not.exist;

  });

  it('should have a callback when logging out', function(done){
    expect(ssNew.isAuthed()).to.not.be.true;

    stub.yields({status: true});

    ssNew.user.auth(userMock);

    ssNew.user.logout(function(status){
      expect(status).to.be.true;
      expect(ssNew.net.sync.calledOnce).to.be.true;
      expect(ssNew.isAuthed()).to.be.false;
      done();
    });
  });

});