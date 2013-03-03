/*jshint camelcase:false */

/**
 * @fileOverview provide an abstraction layer over any underlying xhr library.
 *
 */
goog.provide('ssd.ajax');
goog.provide('ssd.ajax.Method');

goog.require('goog.net.XhrIo');

/**
 * @enum {string}
 */
ssd.ajax.Method = {
  POST: 'post'
};


/**
 * Defines the response object that will be passed on ajax.send callbaks.
 *
 * @typedef {{
 *
 *   httpStatus     : ?number,
 *   success        : boolean,
 *   responseRaw    : ?string,
 *   errorMessage   : ?string
 *   }}
 */
ssd.ajax.ResponseObject;


/**
 * Plainly use google's xhrIo lib for now.
 *
 * Abstract away the intricacies of net.XhrIo and make for easier testing.
 *
 */
ssd.ajax.send = function( url, opt_callback, opt_method, opt_content,
  opt_headers, opt_timeoutInterval, opt_withCredentials) {


  /**
   * Create a wrapping callback that normalizes the parameters of the
   * callback.
   *
   * @param  {goog.events.Event} ev A goog event object.
   */
  var cb = function ssdAjaxSend(ev){

    var origCb = opt_callback || ssd.noop;

    /** @type {ssd.ajax} */
    var xhr = ev.target;

    /**
     * The response object that will be used as the first argument of
     * the original callback.
     *
     * @type {ssd.ajax.ResponseObject}
     */
    var responseObject = {
      httpStatus: null,
      success: false,
      responseRaw: null,
      errorMessage: null
    };

    if ( xhr ) {
      responseObject.httpStatus = xhr.getStatus();
      responseObject.success = xhr.isSuccess();
      responseObject.responseRaw = xhr.getResponse();
      responseObject.errorMessage = xhr.getLastError();
    }
    origCb(responseObject, ev);
  };

  // hijack callback
  var xhrArgs = Array.prototype.slice.call(arguments, 0);
  xhrArgs[1] = cb;
  goog.net.XhrIo.send.apply(null, xhrArgs);

};

