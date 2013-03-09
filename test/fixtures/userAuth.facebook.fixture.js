goog.provide('ssd.test.fixture.auth.fb');

ssd.test.fixture.auth.fb.authedObj = {
  authResponse: {
    accessToken: "ACCESS_TOKEN",
    expiresIn: 5685,
    signedRequest: "xxx",
    userID: "99999999"
  },
  status: "connected"
};

ssd.test.fixture.auth.fb.notAuthedObj = {
  authResponse: undefined,
  status: "unknown"
};

ssd.test.fixture.auth.fb.udo = {
  email: "thanpolas@gmail.com",
  first_name: "Thanasis",
  id: "817295129",
  last_name: "Polychronakis",
  link: "https://www.facebook.com/thanpolas",
  locale: "en_US",
  name: "Thanasis Polychronakis",
  timezone: 2,
  updated_time: "2013-01-18T14:24:17+0000",
  username: "thanpolas",
  verified: true
};