/**
 * @fileOverview main bdd tests setup
 */
goog.provide('ssd.test.main');

goog.require('ssd.test.fixture.auth.fb');
goog.require('ssd.test.fixture.userOne');
goog.require('ssd.test.fixture.userOne');


// goog.require('ssd.test.mock.net');

var expect, assert;
expect = (typeof chai !== "undefined" && chai !== null ?
  chai.expect : void 0) || require('chai').expect;
assert = (typeof chai !== "undefined" && chai !== null ?
  chai.assert : void 0) || require('chai').assert;

/**
 * Declare all third-party namespaces that need to exist
 *
 */
// Facebook JS API
window.FB = {
  init: function(params){},
  Event: {
    subscribe: function(event, cb){}
  },
  getLoginStatus: function(cb){},
  login: function(cb, params){}
};


// stubNet = sinon.stub(ss.sync, 'send');
// stubNet.yields( ss._getResponse( ssd.test.fixture.userOne ));
// stubFBLogin = sinon.stub(FB, 'login')
//   .yields(ssd.test.fixture.auth.fb.authedObj);
// stubgetLoginStatus = sinon.stub(FB, 'getLoginStatus')
//   .yields();

// ss.config('user.auth.fb.appId', '540');
// ss(function() {
//   window.fbAsyncInit();
//   var spyCB = sinon.spy.create('loginCB');
//   ss.user.fb.login(spyCB);
//   console.log( spyCB.callCount );
// });


// var cid = ss.listen('user.initialAuthState', function(){console.log('CALLED')});

// ss();

// var stub = sinon.stub(ss.ajax, 'send');
// var userLoginData = {
//   username: 'thanpolas',
//   password: 'passpass',
//   remember: '1'
// };
// stub.yields( ss._getResponse(ssd.test.fixture.userOne ));

// ss.user.login(userLoginData);

// console.log(ss.isAuthed());

// stub.restore();
