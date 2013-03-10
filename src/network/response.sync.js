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

  /**
   * @type {?number}
   * @expose
   */
  this.httpStatus = null;

  /**
   * @type {?string}
   * @expose
   */
  this.responseRaw = null;

  /**
   * @type {?goog.net.XhrIo}
   * @expose
   */
  this.xhr = null;

  goog.base(this, optResp);

};
goog.inherits( ssd.sync.Response, ssd.Response);


// /**
//  * [T description]
//  * @constructor
//  */
// ssd.sync.T = function() {
//   /**
//    * @type {boolean}
//    * @expose
//    */
//   ssd.sync.T.prototype.sugarFree = false;

//   *
//    * @type {?number}
//    * @expose

//   ssd.sync.T.prototype.httpStatus = null;

//   this.peep = true;
// };



// var z = new ssd.sync.T();

// z.httpStatus = 200;
// z.sugarFree = true;

// window['z'] = z;

