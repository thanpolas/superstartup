goog.provide('ssd.test.userAuth.core');

goog.require('goog.object');

goog.require('ssd.test.fixture.userOne');
goog.require('ssd.test.fixture.event');


describe('User Auth Module :: Core functionality', function () {
    var stub;
    var userFix;
    var event = ssd.test.fixture.event;

    beforeEach(function() {
      userFix = goog.object.unsafeClone(ssd.test.fixture.userOne);
      stub = sinon.stub(ss.sync, 'send');
    });
    afterEach(function() {
      stub.restore();
    });

  describe('Auth / Deauth', function () {
    it('should not be authed (root alias)', function () {
      expect( ss.isAuthed() ).to.be.false;
    });
    it('should not be authed (user method)', function () {
      expect( ss.user.isAuthed() ).to.be.false;
    });

    it('should authenticate with a provided UDO', function(){

      expect( ss.isAuthed() ).to.be.false;

      ss.user.auth( userFix );

      expect( ss.isAuthed() ).to.be.true;
    });
    it('should deauthenticate', function(){
      expect( ss.isAuthed() ).to.be.true;
      ss.user.deAuth();
      expect(ss.isAuthed()).to.be.false;
    });
  });

  describe('Read user data object', function () {

    beforeEach(function() {
      ss.user.auth(userFix);
    });
    afterEach(function() {
      ss.user.deAuth();
    });

    it('should provide the UDO with fancy GetSet', function(){
      // start read tests, first the fancy read
      expect( ss.user('id') ).to.equal(userFix.id);
      expect( ss.user('firstName') ).to.equal(userFix.firstName);
      expect( ss.user('bio') ).to.equal(userFix.bio);
    });
    it('should provide the UDO with get method', function(){
      // now read using the 'get' method
      expect(ss.user.get('id')).to.equal(userFix.id);
      expect(ss.user.get('firstName')).to.equal(userFix.firstName);
      expect(ss.user.get('bio')).to.equal(userFix.bio);
    });
    it('should provide the complete UDO with no args on fancy GetSet', function(){
      // And finally by the raw output
      expect(ss.user().id).to.equal(userFix.id);
      expect(ss.user().firstName).to.equal(userFix.firstName);
      expect(ss.user().bio).to.equal(userFix.bio);
    });
  });


  describe('Core Auth Events', function () {
    beforeEach(function() {
    });
    afterEach(function() {
      ss.user.deAuth();
    });

    it('should trigger the AUTH_CHANGE event synchronously', function(){
      var spy = sinon.spy();
      var cid = ss.listen(event.user.AUTH_CHANGE, spy);
      ss.user.auth( userFix );
      expect( spy.calledOnce ).to.be.true;
      ss.unlisten(cid);
    });

    it('should have authState when AUTH_CHANGE triggers', function(){
      var spy = sinon.spy();
      var cid = ss.listen(event.user.AUTH_CHANGE, spy);
      ss.user.auth( userFix );
      expect( spy.getCall(0).args[0].authState ).to.be.true;
      ss.unlisten(cid);
    });
  });
});
