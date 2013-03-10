/**
 * @fileOverview The response data object used globaly by superstartup.
 */
goog.provide('ssd.user.auth.plugin.Response');

goog.require('goog.object');
goog.require('ssd.user.auth.Response');

/**
 * Defines the response object that will be passed on ajax.send callbaks.
 *
 * @param {ssd.Response=} optResp Another response object to augment.
 * @param {Array.Object=} optChilds An array of object with keys to use for the
 *   response Object.
 * @constructor
 * @extends {ssd.user.auth.Response}
 */
ssd.user.auth.plugin.Response = function( optResp, optChilds ) {
  var childs = optChilds || [];
  childs.push( ssd.user.auth.plugin.response );
  goog.base(this, optResp, childs);
};
goog.inherits( ssd.user.auth.plugin.Response, ssd.user.auth.Response);

/**
 * Will check if type type of inst is an event and only pick
 * the keys of this class.
 *
 * @param  {ssd.Response | goog.events.Event} inst A response object instance to extend.
 * @return {ssd.Response} The augmented resp object although you may use the
 *   resp object provided directly as it is not cloned.
 */
ssd.user.auth.plugin.Response.prototype.extend = function( inst ) {
  if ( inst instanceof goog.events.Event || goog.isObject(inst.target)) {
    this.responsePluginRaw = inst.responsePluginRaw;
    this.authStatePlugin = inst.authStatePlugin;
    this.source = inst.source;
    return this;
  }
  goog.base(this, 'extend', inst);
};

/**
 * The response object.
 *
 * @type {Object}
 */
ssd.user.auth.plugin.response = {

  /** @type {?Object|string} The raw response from the third-party API */
  responsePluginRaw: null,

  /** @type {boolean} The plugin's auth state */
  authStatePlugin: false,

  /** @type {ssd.user.types.extSourceId} The name of the plugin */
  source: ''

};
