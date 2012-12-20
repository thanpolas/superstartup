
goog.provide('ssd.test.user.api');

goog.require('ssd.test.mock.userOne');

function auth () {
  ss.user.auth(ssd.test.mock.userOne);
}

describe('User Module API', function () {
  describe('Core functionality', function () {
    it('should not be authed', function () {
      expect(ss.isAuthed()).to.not.be.True;
      expect(ss.user.isAuthed()).to.not.be.True;
    });

    it('should authenticate us with a provided UDO', function(){
      expect(ss.isAuthed()).to.not.be.True;

      auth();

      expect(ss.isAuthed()).to.be.True;
    });

    it('should logout', function(){
      auth();
      expect(ss.isAuthed()).to.be.True;

      ss.user.logout();

      expect(ss.isAuthed()).to.not.be.True;
    });

  });

  describe('Events', function () {
    before(function () {
      ss.user.logout();
    });

    it('should trigger the auth events', function(){
      var triggered = false;
      // the test is synchronous on purpose
      function cb (eventObj, status) {
        expect(status).to.be.True;
        triggered = true;
      }

      var cid = ss.listen(ssd.test.event.all.AUTH_CHANGE, cb);

      auth();

      expect(ss.isAuthed()).to.be.True;
      expect(triggered).to.be.True;

      ss.removeListener(cid);
    });
  });

});