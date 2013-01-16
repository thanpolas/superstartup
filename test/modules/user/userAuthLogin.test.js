goog.provide('ssd.test.user.api');

goog.require('ssd.test.mock.userOne');

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

  it('should perform a login with the server', function(){
    expect(ssNew.isAuthed()).to.not.be.True;

    // execute the net.sync cb with the mock UDO
    stub.yields(ssd.test.mock.userOne);

    ssNew.user.login(userLogin);

    expect(ssNew.net.sync.calledOnce).to.be.True;
    expect(ssNew.net.sync.alwaysCalledWithMatch(userLogin)).to.be.True;

    expect(ssNew.isAuthed()).to.be.True;
    expect(ssNew.user('id')).to.equal(userMock.id);
  });

  it('should have a callback when using login', function(done){
    // execute the net.sync cb with the mock UDO
    stub.yields(ssd.test.mock.userOne);

    ssNew.user.login(userLogin, function(status, user){
      expect(ssNew.net.sync.calledOnce).to.be.True;
      expect(status).to.be.True;
      expect(user.id).to.equal(userMock.id);
      done();
    });
  });

  it('should perform a logout', function(){
    // We don't really care what
    // the server returns when we send a logout
    // request
    stub.yields({});

    ssNew.user.auth(userMock);

    ssNew.user.logout();
    expect(ssNew.net.sync.calledOnce).to.be.True;
    expect(ssNew.isAuthed()).to.be.False;
  });

  it('should leave no traces of data when logging out', function(){
    stub.yields({});

    ssNew.user.auth(userMock);
    expect(ssNew.user('id')).to.equal(userMock.id);
    ssNew.user.logout();
    expect(ssNew.isAuthed()).to.be.False;
    expect(ssNew.user('id')).to.not.exist;

  });

  it('should have a callback when logging out', function(done){
    expect(ssNew.isAuthed()).to.not.be.True;

    stub.yields({status: true});

    ssNew.user.auth(userMock);

    ssNew.user.logout(function(status){
      expect(status).to.be.True;
      expect(ssNew.net.sync.calledOnce).to.be.True;
      expect(ssNew.isAuthed()).to.be.False;
      done();
    });
  });

});