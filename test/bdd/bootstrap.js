

/**
 * @fileoverview The bootstrap file of all the tests.
 */
goog.provide('ssd.test.bootstrap');

goog.DEBUG = false;

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
