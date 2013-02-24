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
   * A fancy setter / getter instance
   * Manages the local config
   *
   * @type {ssd.fancyGetSet}
   */
  this.config = new ssd.FancyGetSet();
};
goog.inherits(ssd.Module, ssd.events.EventTarget);

