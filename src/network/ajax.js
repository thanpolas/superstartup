/**
 * Provide the Ajax namespace
 *
 */
goog.provide('ssd.ajax');

goog.require('goog.net.XhrIo');

/**
 * Plainly use google's xhrIo lib for now.
 *
 */
ssd.ajax = goog.net.XhrIo.send;