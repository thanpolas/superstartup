
goog.provide('ssd.test.user.api');

describe('User Module API', function () {
  it('should not be authed', function () {
    expect(ss.isAuthed()).to.not.be.True;
    expect(ss.user.isAuthed()).to.not.be.True;
  });
});