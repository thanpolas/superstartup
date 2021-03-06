/**
 * @fileOverview main bdd tests setup
 */
goog.provide('ssd.test.main');

goog.require('ssd.test.fixture.auth.fb');
goog.require('ssd.test.fixture.userOne');
goog.require('ssd.test.fixture.userOne');


mocha.setup({
  globals: [
    'fbAsyncInit',
    'liveReload',
    'LiveReload',
    'open'
  ]
});

// goog.require('ssd.test.mock.net');

var expect, assert;
expect = (typeof chai !== 'undefined' && chai !== null ?
  chai.expect : void 0) || require('chai').expect;
assert = (typeof chai !== 'undefined' && chai !== null ?
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
  getAccessToken: function(){return 'ACCESS_TOKEN';},
  login: function(cb, params){},
  logout: function(){},
  api: function(what, cb){}
};

