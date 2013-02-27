/**
 * Provide the Ajax namespace
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
 * Plainly use google's xhrIo lib for now.
 *
 */
ssd.ajax.send = goog.net.XhrIo.send;