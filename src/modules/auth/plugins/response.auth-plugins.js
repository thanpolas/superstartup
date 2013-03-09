/**
 * @fileOverview The response data object used globaly by superstartup.
 */
goog.provide('ssd.user.auth.plugin.Response');

goog.require('goog.object');
goog.require('ssd.user.auth.Response');

/**
 * Defines the response object that will be passed on ajax.send callbaks.
 *
 *
 * @constructor
 * @extends {ssd.user.auth.Response}
 */
ssd.user.auth.plugin.Response = function() {
  goog.base(this);

  goog.object.map(ssd.sync.response, function(el, ind){
    this[ind] = el;
  }, this);

};
goog.inherits( ssd.user.auth.plugin.Response, ssd.user.auth.Response);


/**
 * The response object.
 *
 * @type {Object}
 */
ssd.user.auth.plugin.response = {

  /** @type {?Object|string} The raw response from the third-party API */
  rawThirdParty: null

};
