/**
 * @fileoverview The response data object used globaly by superstartup.
 */
goog.provide('ssd.user.auth.Response');

goog.require('goog.object');
goog.require('ssd.Response');
goog.require('ssd.sync.Response');

/**
 * Defines the response object that will be passed on ajax.send callbaks.
 *
 *
 * @param {ssd.Response=} optResp Another response object to augment.
 * @constructor
 * @extends {ssd.sync.Response}
 */
ssd.user.auth.Response = function( optResp ) {

  /**
   * @type {boolean} The current authentication state
   * @expose
   */
  this.authState = false;

  /**
   * @type {Object} User data Object
   * @expose
   */
  this.udo = null;

  /**
   * @type {?Object|string} The raw response from the server
   * @expose
   */
  this.serverRaw = null;

  goog.base(this, optResp);

};
goog.inherits( ssd.user.auth.Response, ssd.sync.Response);


