/**
 * Provide the Ajax namespace
 *
 */
goog.provide('ssd.sync');

goog.require('ssd.ajax');

/**
 * Plainly use google's xhrIo lib for now.
 *
 */
ssd.sync = ssd.ajax;