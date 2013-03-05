/**
 * Provide one more abstraction layer on data transportation.
 *
 * Allow for sockers or xhr.
 *
 */
goog.provide('ssd.sync');
goog.provide('ssd.sync.Response');
goog.require('ssd.ajax');


/**
 * Defines the response object that will be passed on ajax.send callbaks.
 *
 *
 * @constructor
 */
ssd.sync.Response = function() {

  /** @type {?number} */
  this['httpStatus'] = null;
  /** @type {boolean} */
  this.success = false;
  /** @type {?string} */
  this.responseRaw = null;
  /** @type {?string} */
  this.errorMessage = null;
  /** @type {?goog.net.XhrIo} */
  this.xhr = null;
};

/**
 * Hard wire to xhr send for now
 *
 * @return {when.Promise} a promise.
 */
ssd.sync.send = function() {
  return ssd.ajax.send.apply(undefined, arguments);
};

