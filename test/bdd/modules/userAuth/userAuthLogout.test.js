goog.provide('ssd.test.userAuth.logout');

goog.require('ssd.test.fixture.userOne');
goog.require('ssd.test.fixture.event');
goog.require('ssd.test.mock.net');

describe('4. User Auth Module :: Logging out', function () {
  var stub;
  var userFix = ssd.test.fixture.userOne;
  var userEvent = ssd.test.fixture.event.user;
  var stubResponse = {status: true};

  beforeEach(function() {
    ss.user.auth( userFix );
    if ( ss.sync.send.id ) { ss.sync.send.restore(); }
    stub = sinon.stub(ss.sync, 'send');
    stub.returns( ss._getResponse( userFix ) );
  });
  afterEach(function() {
    stub.restore();
    ss.removeAllListeners();
  });

  it('4.0.1 should be authenticated when starting a logout test', function(){
    expect( ss.isAuthed() ).to.be.true;
  });


  it('4.0.2 should perform an xhr request on logout', function(){
    ss.user.logout();
    expect(stub.calledOnce).to.be.true;
  });

  it('4.0.3 should deauth on logout', function(){
    ss.user.logout();
    expect(stub.calledOnce).to.be.true;
    expect(ss.isAuthed()).to.be.false;
  });

  it('4.0.4 should leave no traces of data when logging out', function(){
    expect(ss.user('id')).to.equal(userFix.id);
    ss.user.logout();
    expect(ss.isAuthed()).to.be.false;
    expect(ss.user('id')).to.not.exist;

  });

  it('4.0.5 should have a callback when logging out', function(done){
    var spy = sinon.spy();
    ss.user.logout(spy).then(function(){
      expect( spy.calledOnce ).to.be.true;
      done();
    }, done).otherwise(done);
  });
  it('4.0.6 should not be authed inside the callback', function(done) {
    ss.user.logout(function(err, success){
      expect(ss.isAuthed()).to.be.false;
      done();
    });
  });
  it('4.0.7 the callback should have two arguments', function(done) {
    var spy = sinon.spy();
    ss.user.logout(spy).then(function(){
      var args = spy.getCall(0).args;
      expect( args.length ).to.equal(2);
      done();
    }, done).otherwise(done);
  });
  it('4.0.8 callback first arg is the err and should be null', function(done) {
    var spy = sinon.spy();
    ss.user.logout(spy).then(function(){
      var args = spy.getCall(0).args;
      expect( args[0] ).to.be.null;
      done();
    }, done).otherwise(done);

  });
  it('4.0.9 callback second arg is the success and should be true', function(done) {
    var spy = sinon.spy();
    ss.user.logout(spy).then(function(){
      var args = spy.getCall(0).args;
      expect( args[1] ).to.be.a('boolean');
      expect( args[1] ).to.be.true;
      done();
    }, done).otherwise(done);

  });
  it('4.0.10 should trigger the AUTH_CHANGE event', function(){
    var spy = sinon.spy();
    ss.listen(userEvent.AUTH_CHANGE, spy);
    ss.user.logout();
    expect( spy.calledOnce ).to.be.true;
  });
  it('4.0.11 should trigger the BEFORE_LOGOUT event', function(){
    var spy = sinon.spy();
    ss.listen(userEvent.BEFORE_LOGOUT, spy);
    ss.user.logout();
    expect( spy.calledOnce ).to.be.true;
  });
  it('4.0.12 should trigger the ON_LOGOUT_RESPONSE event', function(done){
    var spy = sinon.spy();
    ss.listen(userEvent.ON_LOGOUT_RESPONSE, spy);
    ss.user.logout().then(function(){
      expect( spy.calledOnce ).to.be.true;
      done();
    }, done).otherwise(done);

  });
  it('4.0.13 should trigger the AFTER_LOGOUT_RESPONSE event', function(done){
    var spy = sinon.spy();
    ss.listen(userEvent.AFTER_LOGOUT_RESPONSE, spy);
    ss.user.logout().then(function(){
      expect( spy.calledOnce ).to.be.true;
      done();
    }, done).otherwise(done);

  });

  it('4.0.14 should trigger events in the right order', function(done){
    var spyBeforeLogout =        sinon.spy(),
        spyAuthChange =          sinon.spy(),
        spyOnLogoutResponse =    sinon.spy(),
        spyAfterLogoutResponse = sinon.spy();

    ss.listen(userEvent.BEFORE_LOGOUT, spyBeforeLogout);
    ss.listen(userEvent.AUTH_CHANGE, spyAuthChange);
    ss.listen(userEvent.ON_LOGOUT_RESPONSE, spyOnLogoutResponse);
    ss.listen(userEvent.AFTER_LOGOUT_RESPONSE, spyAfterLogoutResponse);

    ss.user.logout().then(function(){
      expect( spyBeforeLogout.calledBefore( spyAuthChange )).to.be.true;
      expect( spyAuthChange.calledBefore( spyOnLogoutResponse )).to.be.true;
      expect( spyOnLogoutResponse.calledBefore( spyAfterLogoutResponse )).to.be.true;
      done();
    }, done).otherwise(done);

  });

  it('4.0.15 should trigger the AUTH_CHANGE event and provide authState key', function(done){
    ss.listen(userEvent.AUTH_CHANGE, function(eventObj){
      expect( eventObj.authState ).to.be.false;
      done();
    });
    ss.user.logout();
  });

  it('4.0.16 should trigger the AUTH_CHANGE event and not be authed', function(done){
    ss.listen(userEvent.AUTH_CHANGE, function(eventObj){
      expect(ss.isAuthed()).to.be.false;
      done();
    });
    ss.user.logout();
  });

  it('4.0.17 should cancel logout if we return false at the BEFORE_LOGOUT event', function(){
    ss.listen(userEvent.BEFORE_LOGOUT, function(eventObj){
      return false;
    });
    ss.user.logout();
    expect(stub.called).to.be.false;
    expect(ss.isAuthed()).to.be.true;
  });

});
