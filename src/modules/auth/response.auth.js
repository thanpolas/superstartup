/**
 * @fileOverview The response data object used globaly by superstartup.
 */
goog.provide('ssd.user.auth.Response');

goog.require('goog.object');
goog.require('ssd.sync.Response');

/**
 * Defines the response object that will be passed on ajax.send callbaks.
 *
 *
 * @constructor
 * @extends {ssd.sync.Response}
 */
ssd.user.auth.Response = function() {
  goog.base(this);

  goog.object.map(ssd.sync.response, function(el, ind){
    this[ind] = el;
  }, this);

};
goog.inherits( ssd.user.auth.Response, ssd.sync.Response);


/**
 * The response object.
 *
 * @type {Object}
 */
ssd.user.auth.response = {

  /** @type {boolean} The current authentication state */
  authState: false,

  /** @type {?Object|string} The raw response from the server */
  rawServer: null


};
