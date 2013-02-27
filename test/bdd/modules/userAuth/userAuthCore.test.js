goog.provide('ssd.test.userAuth.core');

goog.require('goog.object');

goog.require('ssd.test.fixture.userOne');
goog.require('ssd.test.fixture.event');


describe('User Auth Module :: Core functionality', function () {
  var ssNew;
  var stub;
  var userFix;
  var event = ssd.test.fixture.event;

  beforeEach(function() {
    ssNew = new ss();
    ssNew();
    userFix = goog.object.unsafeClone(ssd.test.fixture.userOne);
    stub = sinon.stub(ssNew.ajax, 'send');
  });
  afterEach(function() {
    stub.restore();
  });


  describe('Auth / Deauth', function () {
    it('should not be authed (root alias)', function () {
      expect(ssNew.isAuthed()).to.be.false;
    });
    it('should not be authed (user method)', function () {
      expect(ssNew.user.isAuthed()).to.be.false;
    });

    it('should authenticate with a provided UDO', function(){
      expect(ssNew.isAuthed()).to.not.be.true;

      ssNew.user.auth(ssd.test.fixture.userOne);

      expect(ssNew.isAuthed()).to.be.true;
    });
    it('should deauthenticate', function(){
      ssNew.user.auth(ssd.test.fixture.userOne);
      expect(ssNew.isAuthed()).to.be.true;

      ssNew.user.deAuth();

      expect(ssNew.isAuthed()).to.not.be.true;
    });
  });

  describe('Read user data object', function () {
    it('should authenticate us if we provide a UDO', function(){
      expect(ssNew.isAuthed()).to.not.be.true;
      ssNew.user.auth(userFix);
      expect(ssNew.isAuthed()).to.be.true;
    });
    it('should provide the UDO with fancy GetSet', function(){
      ssNew.user.auth(userFix);
      console.log(userFix);
      // start read tests, first the fancy read
      expect(ssNew.user('id')).to.equal(userFix.id);
      expect(ssNew.user('firstName')).to.equal(userFix.firstName);
      expect(ssNew.user('bio')).to.equal(userFix.bio);
    });
    it('should provide the UDO with get method', function(){
      ssNew.user.auth(userFix);

      // now read using the 'get' method
      expect(ssNew.user.get('id')).to.equal(userFix.id);
      expect(ssNew.user.get('firstName')).to.equal(userFix.firstName);
      expect(ssNew.user.get('bio')).to.equal(userFix.bio);
    });
    it('should provide the complete UDO with no args on fancy GetSet', function(){
      ssNew.user.auth(userFix);

      // And finally by the raw output
      expect(ssNew.user().id).to.equal(userFix.id);
      expect(ssNew.user().firstName).to.equal(userFix.firstName);
      expect(ssNew.user().bio).to.equal(userFix.bio);
    });
  });


  describe('Core Auth Events', function () {
    before(function () {
      ssNew.user.deAuth();
    });

    it('should trigger the auth event synchronously', function(){
      var triggered = false;
      // the test is synchronous on purpose
      function cb (eventObj) {
        expect(eventObj.authState).to.be.true;
        triggered = true;
      }

      var cid = ssNew.listen(event.user.AUTH_CHANGE, cb);

      ssNew.user.auth(ssd.test.fixture.userOne);

      expect(ssNew.isAuthed()).to.be.true;
      expect(triggered).to.be.true;

      ssNew.removeListener(cid);
    });

    it('should trigger an initial auth status event after core init',
      function(done){
      var triggered = false;
      // the test is synchronous on purpose
      function cb (eventObj) {
        expect(eventObj.authState).to.be.a('boolean');
        expect(eventObj.authState).to.be.false;
        triggered = true;
        expect(ssAltNew.isAuthed()).to.be.false;
        done();
      }

      ssAltNew = new ss();

      var cid = ssAltNew.listen(event.user.INITIAL_AUTH_STATUS, cb);

      // boot up the app
      ssAltNew();
    });
  });
});
