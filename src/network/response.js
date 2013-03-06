/**
 * @fileOverview The response data object used globaly by superstartup.
 */
goog.provide('ssd.sync.Response');

goog.require('goog.object');

/**
 * Defines the response object that will be passed on ajax.send callbaks.
 *
 *
 * @constructor
 */
ssd.sync.Response = function() {
  goog.object.map(ssd.sync.response, function(el, ind){
    this[ind] = el;
  }, this);

  // return goog.object.clone(ssd.sync.response);
};

/**
 * The response object.
 *
 * @type {Object}
 */
ssd.sync.response = {
  /** @type {?number} */
  httpStatus: null,
  /** @type {boolean} */
  success: false,
  /** @type {?string} */
  responseRaw: null,
  /** @type {?string} */
  errorMessage: null,
  /** @type {?goog.net.XhrIo} */
  xhr: null
};
