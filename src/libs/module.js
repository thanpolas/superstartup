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

};
goog.inherits(ssd.Module, ssd.events.EventTarget);

