/**
 * @fileoverview The response data object used globaly by superstartup.
 */
goog.provide('ssd.sync.Response');
goog.provide('ssd.sync.T');

goog.require('goog.object');
goog.require('ssd.Response');

/**
 * Defines the response object that will be passed on ajax.send callbaks.
 *
 * @param {ssd.Response=} optResp Another response object to augment.
 * @constructor
 * @extends {ssd.Response}
 */
ssd.sync.Response = function( optResp ) {

  /** @type {?number} */
  this['httpStatus'] = null;

  /** @type {?string} */
  this['responseRaw'] = null;

  /** @type {?goog.net.XhrIo} */
  this['xhr'] = null;

  goog.base(this, optResp);

};
goog.inherits( ssd.sync.Response, ssd.Response);






