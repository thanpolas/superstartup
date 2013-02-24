/**
 * @fileoverview The default Module that all classes extend.
 */
goog.provide('ssd.Module');

goog.require('ssd.events.EventTarget');
/**
 * The basic Module class
 *
 * @constructor
 * @extends {ssd.events.EventTarget}
 */
ssd.Module = function() {
  goog.base(this);

  /**
   * @type {ssd.Config} The configuration singleton instance.
   * @private
   */
  this._config = ssd.Config.getInstance();
};
goog.inherits(ssd.Module, ssd.events.EventTarget);

