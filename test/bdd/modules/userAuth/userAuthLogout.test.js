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
    stub = sinon.stub(ssNew.ajax, 'send');
    stub.yields(stubResponse);
  });
  afterEach(function() {
    stub.restore();
  });

  it('should perform an xhr request on logout', function(){
    ssNew.user.logout();
    expect(stub.calledOnce).to.be.true;
  });

  it('should deauth on logout', function(){
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
    ssNew.user.logout(function(err, success){
      expect(success).to.be.true;
      expect(stub.calledOnce).to.be.true;
      expect(ssNew.isAuthed()).to.be.false;
      done();
    });
  });

  it('should trigger the AUTH_CHANGE event', function(){
    var spy = sinon.spy();
    ssNew.listen(userEvent.AUTH_CHANGE, spy);
    ssNew.user.logout();
    expect( spy.calledOnce ).to.be.true;
  });
  it('should trigger the BEFORE_LOGOUT event', function(){
    var spy = sinon.spy();
    ssNew.listen(userEvent.BEFORE_LOGOUT, spy);
    ssNew.user.logout();
    expect( spy.calledOnce ).to.be.true;
  });
  it('should trigger the ON_LOGOUT_RESPONSE event', function(){
    var spy = sinon.spy();
    ssNew.listen(userEvent.ON_LOGOUT_RESPONSE, spy);
    ssNew.user.logout();
    expect( spy.calledOnce ).to.be.true;
  });
  it('should trigger the AFTER_LOGOUT_RESPONSE event', function(){
    var spy = sinon.spy();
    ssNew.listen(userEvent.AFTER_LOGOUT_RESPONSE, spy);
    ssNew.user.logout();
    expect( spy.calledOnce ).to.be.true;
  });

  it('should trigger events in the right order', function(){
    var spyBeforeLogout =        sinon.spy(),
        spyAuthChange =          sinon.spy(),
        spyOnLogoutResponse =    sinon.spy(),
        spyAfterLogoutResponse = sinon.spy();

    ssNew.listen(userEvent.BEFORE_LOGOUT, spyBeforeLogout);
    ssNew.listen(userEvent.AUTH_CHANGE, spyAuthChange);
    ssNew.listen(userEvent.ON_LOGOUT_RESPONSE, spyOnLogoutResponse);
    ssNew.listen(userEvent.AFTER_LOGOUT_RESPONSE, spyAfterLogoutResponse);

    ssNew.user.logout();

    expect( spyBeforeLogout.calledBefore( spyAuthChange )).to.be.true;
    expect( spyAuthChange.calledBefore( spyOnLogoutResponse )).to.be.true;
    expect( spyOnLogoutResponse.calledBefore( spyAfterLogoutResponse )).to.be.true;
  });

  it('should trigger the AUTH_CHANGE event and provide authState key', function(done){
    ssNew.listen(userEvent.AUTH_CHANGE, function(eventObj){
      expect(eventObj.authState).to.be.false;
      done();
    });
    ssNew.user.logout();
  });

  it('should trigger the AUTH_CHANGE event and not be authed', function(done){
    ssNew.listen(userEvent.AUTH_CHANGE, function(eventObj){
      expect(ssNew.isAuthed()).to.be.false;
      done();
    });
    ssNew.user.logout();
  });

  it('should cancel logout if we return false at the BEFORE_LOGOUT event', function(){
    ssNew.listen(userEvent.BEFORE_LOGOUT, function(eventObj){
      return false;
    });
    ssNew.user.logout();
    expect(stub.called).to.be.false;
    expect(ssNew.isAuthed()).to.be.true;
  });

});
