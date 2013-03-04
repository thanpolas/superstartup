/**
 * Provide one more abstraction layer on data transportation.
 *
 * Allow for sockers or xhr.
 *
 */
goog.provide('ssd.sync');

goog.require('ssd.ajax');


/**
 * Defines the response object that will be passed on ajax.send callbaks.
 *
 * @typedef {{
 *
 *   httpStatus     : ?number,
 *   success        : boolean,
 *   responseRaw    : ?string,
 *   errorMessage   : ?string,
 *   xhr            : goog.net.XhrIo
 * }}
 */
ssd.sync.ResponseObject;

/**
 * Hard wire to xhr send for now
 *
 * @return {when.Promise} a promise.
 */
ssd.sync.send = function() {
  return ssd.ajax.send.apply(undefined, arguments);
};

