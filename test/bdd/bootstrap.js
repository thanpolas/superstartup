/**
 * @fileoverview The bootstrap file of all the tests.
 */
goog.provide('ssd.test.bootstrap');


// setup mocha
mocha.ui('bdd');
mocha.reporter('markdown');


// sequence matters
goog.require('ssd.test.fixture.userOne');

goog.require('ssd.test.main');

goog.require('ssd.test.core');
goog.require('ssd.test.event.api');
goog.require('ssd.test.userAuth.core');
goog.require('ssd.test.userAuth.login');

goog.require('ssd.test.userAuth.logout');

goog.require('ssd.test.userAuth.facebook');

goog.require('ssd.test.userAuth.twitter');
