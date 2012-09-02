/**
 * Copyright 2000-2011 Athanasios Polychronakis. Some Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 * createdate 02/Sep/2012
 */

 /**
  * @fileoverview An extension of goog.events.EventTarget that adds
  *               superstartup specific functionality like the
  *               eventPath.
  */

goog.provide('ssd.events.EventTarget');

goog.require('ssd.types');
goog.require('goog.events');
goog.require('goog.events.EventTarget');

/**
 * The basic Module class
 *
 * @constructor
 * @extends {goog.events.EventTarget}
 */
ssd.events.EventTarget = function() {
  goog.base(this);

  /**
   * The eventpath we will prepend to all the events
   * this class will emit
   * @type {string}
   */
  this._eventPath = '';

};
goog.inherits(ssd.events.EventTarget, goog.events.EventTarget);

/**
 * Define the event path we'll prepend to all events
 * that this class will emit.
 *
 * @param {string} path The event path we want to prepend
 * @return {void}
 */
ssd.events.EventTarget.prototype.setEventPath = function(path)
{
  // check if there's a dot in the end of the string
  if ('.' !== path.substr(-1) && 0 < path.legth) {
    this._eventPath = path + '.';
  } else {
    this._eventPath = path;
  }

};

/**
 * Will return the exact event type that will be emitted
 * based on the eventPath that was set and the eventType that
 * was provided
 *
 * @param  {string} eventType The eventType we want to listen or trigger.
 * @return {string} The evenType along with the full path.
 */
ssd.events.EventTarget.prototype.getEventType = function(eventType)
{
  return this._eventPath + eventType;
};

/**
 * We overwrite dispatchEvent to inject the eventPath on the eventType
 * string.
 *
 * Dispatches an event (or event like object) and calls all listeners
 * listening for events of this type. The type of the event is decided by the
 * type property on the event object.
 *
 * If any of the listeners returns false OR calls preventDefault then this
 * function will return false.  If one of the capture listeners calls
 * stopPropagation, then the bubble listeners won't fire.
 *
 * @param {string|Object|goog.events.Event} e Event object.
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the handlers returns false this will also return false.
 */
ssd.events.EventTarget.prototype.dispatchEvent = function(e)
{
  // examine what type e is
  switch (goog.typeOf(e)) {
    case ssd.types.STRING:
      e = this._eventPath + e;
    break;
    case ssd.types.OBJECT:
      e['type'] = this._eventPath + e['type'];
    break;
  }

  return ssd.events.EventTarget.superClass_.dispatchEvent.call(this, e);
};

