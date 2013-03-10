/*jshint camelcase:false */

/**
 * @fileoverview provide an abstraction layer over any underlying xhr library.
 *
 */
goog.provide('ssd.ajax');
goog.provide('ssd.ajax.Method');


goog.require('goog.net.XhrIo');
goog.require('ssd.sync.Response');

/**
 * @enum {string}
 */
ssd.ajax.Method = {
  POST: 'post'
};




/**
 * Plainly use google's xhrIo lib for now.
 *
 * Abstract away the intricacies of net.XhrIo and make for easier testing.
 *
 * @return {when.Promise} a promise.
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
     * @type {ssd.sync.Response}
     */
    var response = new ssd.sync.Response();

    if ( xhr ) {
      response['httpStatus'] = xhr.getStatus();
      response['success'] = xhr.isSuccess();
      response['responseRaw'] = xhr.getResponse();
      response['errorMessage'] = xhr.getLastError();
      response['xhr'] = xhr;
    }

    if (response.success) {
      def.resolve(response);
    } else {
      def.reject(response);
    }
    origCb(response);
  };

  var def = when.defer();

  // hijack callback
  var xhrArgs = Array.prototype.slice.call(arguments, 0);
  xhrArgs[1] = cb;
  goog.net.XhrIo.send.apply(null, xhrArgs);

};

