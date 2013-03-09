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
 * @param {ssd.Response=} optResp Another response object to augment.
 * @param {Array.Object=} optChilds An array of object with keys to use for the
 *   response Object.
 * @constructor
 */
ssd.Response = function( optResp, optChilds ) {
  var childs = optChilds || [];

  this._copyDefaults( ssd.response );
  // if childs are there then the first item is the top-most child,
  // so we want to start from the bottom up
  var len = childs.length;
  while(len--) {
    this._copyDefaults( childs[len] );
  }

  if (optResp && optResp.extend) {
    optResp.extend(this);
  }

};

/**
 * Copy the default key/value pairs from the provided object.
 *
 * @param {Object} obj the object with the default values.
 * @private
 */
ssd.Response.prototype._copyDefaults = function(obj) {
  goog.object.map( obj , function(el, ind){
    this[ind] = el;
  }, this);
};

/**
 * Will augment the provided response object with the values of this one.
 *
 * The extending resp obj overwrites values of the provided one.
 *
 * @param  {ssd.Response} inst A response object instance to extend.
 * @return {ssd.Response} The augmented resp object although you may use the
 *   resp object provided directly as it is not cloned.
 */
ssd.Response.prototype.extend = function( inst ) {
  var clonedSelf = goog.object.clone( this );
  // remove methods
  delete clonedSelf.extend;
  delete clonedSelf.event;
  delete clonedSelf._copyDefaults;

  goog.object.extend( inst, clonedSelf );

  return inst;
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
