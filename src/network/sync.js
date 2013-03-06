/**
 * Provide one more abstraction layer on data transportation.
 *
 * Allow for sockers or xhr.
 *
 */
goog.provide('ssd.sync');

goog.require('ssd.ajax');
goog.require('ssd.sync.Response');



/**
 * Hard wire to xhr send for now
 *
 * @return {when.Promise} a promise.
 */
ssd.sync.send = function() {
  return ssd.ajax.send.apply(undefined, arguments);
};

