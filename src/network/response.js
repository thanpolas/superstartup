/**
 * @fileOverview The response data object used globaly by superstartup.
 */
goog.provide('ssd.sync.Response');

goog.require('goog.object');
goog.require('ssd.Response');

/**
 * Defines the response object that will be passed on ajax.send callbaks.
 *
 *
 * @constructor
 * @extends {ssd.Response}
 */
ssd.sync.Response = function() {
  goog.base(this);

  goog.object.map(ssd.sync.response, function(el, ind){
    this[ind] = el;
  }, this);

};
goog.inherits( ssd.sync.Response, ssd.Response);


/**
 * The response object.
 *
 * @type {Object}
 */
ssd.sync.response = {

  /** @type {?number} */
  httpStatus: null,

  /** @type {?string} */
  rawResponse: null,

  /** @type {?goog.net.XhrIo} */
  xhr: null
};
