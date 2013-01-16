
goog.provide('ssd.test.user.api');

goog.require('ssd.test.mock.userOne');

describe('User Auth Module :: Core functionality', function () {
  describe('Auth / Deauth', function () {
    it('should not be authed', function () {
      expect(ss.isAuthed()).to.not.be.True;
      expect(ss.user.isAuthed()).to.not.be.True;
    });

    it('should authenticate with a provided UDO', function(){
      expect(ss.isAuthed()).to.not.be.True;

      ss.user.auth(ssd.test.mock.userOne);

      expect(ss.isAuthed()).to.be.True;
    });

    it('should deauthenticate', function(){
      ss.user.auth(ssd.test.mock.userOne);
      expect(ss.isAuthed()).to.be.True;

      ss.user.deAuth();

      expect(ss.isAuthed()).to.not.be.True;
    });
  });

  describe('Read user data object', function () {
    it('should return the values of the provided UDO', function(){
      var userMock = ssd.test.mock.userOne;
      expect(ss.isAuthed()).to.not.be.True;
      ss.user.auth(userMock);
      expect(ss.isAuthed()).to.be.True;

      // start read tests, first the fancy read
      expect(ss.user('id')).to.equal(userMock.id);
      expect(ss.user('firstName')).to.equal(userMock.firstName);
      expect(ss.user('bio')).to.equal(userMock.bio);

      // now read using the 'get' method
      expect(ss.user.get('id')).to.equal(userMock.id);
      expect(ss.user.get('firstName')).to.equal(userMock.firstName);
      expect(ss.user.get('bio')).to.equal(userMock.bio);

    });


  describe('Core Auth Events', function () {
    before(function () {
      ss.user.deAuth();
    });

    it('should trigger the auth event synchronously', function(){
      var triggered = false;
      // the test is synchronous on purpose
      function cb (eventObj, authStatus) {
        expect(authStatus).to.be.True;
        triggered = true;
      }

      var cid = ss.listen(ssd.test.event.all.AUTH_CHANGE, cb);

      ss.user.auth(ssd.test.mock.userOne);

      expect(ss.isAuthed()).to.be.True;
      expect(triggered).to.be.True;

      ss.removeListener(cid);
    });

    it('should trigger an initial auth status event after core init', function(){
      var triggered = false;
      // the test is synchronous on purpose
      function cb (eventObj, authStatus) {
        expect(authStatus).to.be.a('boolean');
        triggered = true;
      }

      var ssNew = new ss();
      var cid = ssNew.listen(ssd.test.event.all.INITIAL_AUTH_STATUS, cb);

      // boot up the app
      ssNew();

      expect(ss.isAuthed()).to.be.False;
      expect(triggered).to.be.True;

      ss.removeListener(cid);

    });
  });
});
