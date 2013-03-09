/**
 * @fileOverview The response data object used globaly by superstartup.
 */
goog.provide('ssd.Response');

goog.require('goog.object');
goog.require('goog.events.Event');

/**
 * The response data object used globaly by superstartup.
 *
 *
 * @constructor
 */
ssd.Response = function() {
  goog.object.map(ssd.response, function(el, ind){
    this[ind] = el;
  }, this);
};

/**
 * get the response object augmented by an event object.
 *
 * @param  {string} eventType The event type.
 * @param  {Object=} optTarget the target of the event.
 * @return {goog.events.Event} An event item to dispatch.
 */
ssd.Response.prototype.event = function( eventType, optTarget ) {
  var ev = new goog.events.Event(eventType, optTarget);

  goog.object.extend( ev, this );

  return ev;
};

/**
 * The response object.
 *
 * @type {Object}
 */
ssd.response = {

  /** @type {boolean} */
  success: false,

  /** @type {?string} */
  errorMessage: null

};
