/**
 * @fileoverview The bootstrap file of all the tests.
 */
goog.provide('ssd.test.bootstrap');

mocha.ui('bdd');
mocha.reporter('html');
mocha.setup({
  globals: ['fbAsyncInit', 'liveReload']
});

var expect;
expect = (typeof chai !== "undefined" && chai !== null ?
  chai.expect : void 0) || require('chai').expect;

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

// sequence matters
goog.require('ssd.test.core');
goog.require('ssd.test.event.api');
goog.require('ssd.test.userAuth.core');
//goog.require('ssd.test.userAuth.login');

// var ssNew = new ss();
// var cid = ssNew.listen('user.initialAuthState', function(){console.log('CALLED')});

// ssNew();
// ss();
// console.log(ss.isReady());