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
 * @param {ssd.Response=} optResp Another response object to augment.
 * @param {Array.Object=} optChilds An array of object with keys to use for the
 *   response Object.
 * @constructor
 * @extends {ssd.sync.Response}
 */
ssd.user.auth.Response = function( optResp, optChilds ) {
  var childs = optChilds || [];
  childs.push( ssd.user.auth.response );
  goog.base(this, optResp, childs);

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

  /** @type {Object} User data Object */
  udo: null,

  /** @type {?Object|string} The raw response from the server */
  serverRaw: null


};
