/**
 * @fileOverview The response data object used globaly by superstartup.
 */
goog.provide('ssd.sync.Response');

goog.require('goog.object');
goog.require('ssd.Response');

/**
 * Defines the response object that will be passed on ajax.send callbaks.
 *
 * @param {ssd.Response=} optResp Another response object to augment.
 * @param {Array.Object=} optChilds An array of object with keys to use for the
 *   response Object.
 * @constructor
 * @extends {ssd.Response}
 */
ssd.sync.Response = function( optResp, optChilds ) {
  var childs = optChilds || [];
  childs.push( ssd.sync.response );
  goog.base(this, optResp, childs);
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
  responseRaw: null,

  /** @type {?goog.net.XhrIo} */
  xhr: null
};
