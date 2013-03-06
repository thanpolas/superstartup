goog.provide('ssd.test.userAuth.logout');

goog.require('ssd.test.fixture.userOne');
goog.require('ssd.test.fixture.event');
goog.require('ssd.test.mock.net');

describe('User Auth Module :: Logging out', function () {
  var stub;
  var userFix = ssd.test.fixture.userOne;
  var userEvent = ssd.test.fixture.event.user;
  var stubResponse = {status: true};

  beforeEach(function() {
    ss.user.auth( userFix );
    stub = sinon.stub(ss.sync, 'send');
    stub.yields( ss._getResponse( userFix ) );
  });
  afterEach(function() {
    stub.restore();
    ss.removeAllListeners();
  });

  it('should be authenticated when starting a logout test', function(){
    expect( ss.isAuthed() ).to.be.true;
  });


  it('should perform an xhr request on logout', function(){
    ss.user.logout();
    expect(stub.calledOnce).to.be.true;
  });

  it('should deauth on logout', function(){
    ss.user.logout();
    expect(stub.calledOnce).to.be.true;
    expect(ss.isAuthed()).to.be.false;
  });

  it('should leave no traces of data when logging out', function(){
    expect(ss.user('id')).to.equal(userFix.id);
    ss.user.logout();
    expect(ss.isAuthed()).to.be.false;
    expect(ss.user('id')).to.not.exist;

  });

  it('should have a callback when logging out', function(done){
    ss.user.logout(function(err, success){
      expect(success).to.be.true;
      expect(stub.calledOnce).to.be.true;
      expect(ss.isAuthed()).to.be.false;
      done();
    });
  });

  it('should trigger the AUTH_CHANGE event', function(){
    var spy = sinon.spy();
    ss.listen(userEvent.AUTH_CHANGE, spy);
    ss.user.logout();
    expect( spy.calledOnce ).to.be.true;
  });
  it('should trigger the BEFORE_LOGOUT event', function(){
    var spy = sinon.spy();
    ss.listen(userEvent.BEFORE_LOGOUT, spy);
    ss.user.logout();
    expect( spy.calledOnce ).to.be.true;
  });
  it('should trigger the ON_LOGOUT_RESPONSE event', function(){
    var spy = sinon.spy();
    ss.listen(userEvent.ON_LOGOUT_RESPONSE, spy);
    ss.user.logout();
    expect( spy.calledOnce ).to.be.true;
  });
  it('should trigger the AFTER_LOGOUT_RESPONSE event', function(){
    var spy = sinon.spy();
    ss.listen(userEvent.AFTER_LOGOUT_RESPONSE, spy);
    ss.user.logout();
    expect( spy.calledOnce ).to.be.true;
  });

  it('should trigger events in the right order', function(){
    var spyBeforeLogout =        sinon.spy(),
        spyAuthChange =          sinon.spy(),
        spyOnLogoutResponse =    sinon.spy(),
        spyAfterLogoutResponse = sinon.spy();

    ss.listen(userEvent.BEFORE_LOGOUT, spyBeforeLogout);
    ss.listen(userEvent.AUTH_CHANGE, spyAuthChange);
    ss.listen(userEvent.ON_LOGOUT_RESPONSE, spyOnLogoutResponse);
    ss.listen(userEvent.AFTER_LOGOUT_RESPONSE, spyAfterLogoutResponse);

    ss.user.logout();

    expect( spyBeforeLogout.calledBefore( spyAuthChange )).to.be.true;
    expect( spyAuthChange.calledBefore( spyOnLogoutResponse )).to.be.true;
    expect( spyOnLogoutResponse.calledBefore( spyAfterLogoutResponse )).to.be.true;
  });

  it('should trigger the AUTH_CHANGE event and provide authState key', function(done){
    ss.listen(userEvent.AUTH_CHANGE, function(eventObj){
      expect( eventObj.authState ).to.be.false;
      done();
    });
    ss.user.logout();
  });

  it('should trigger the AUTH_CHANGE event and not be authed', function(done){
    ss.listen(userEvent.AUTH_CHANGE, function(eventObj){
      expect(ss.isAuthed()).to.be.false;
      done();
    });
    ss.user.logout();
  });

  it('should cancel logout if we return false at the BEFORE_LOGOUT event', function(){
    ss.listen(userEvent.BEFORE_LOGOUT, function(eventObj){
      return false;
    });
    ss.user.logout();
    expect(stub.called).to.be.false;
    expect(ss.isAuthed()).to.be.true;
  });

});
