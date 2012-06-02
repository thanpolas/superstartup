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
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 28/Sep/2010
 *
 *********
 *  File:: system/listeners.js
 *  Global Listeners Class
 *********
 */

goog.provide('ss.Events');

/**
 * Will provide event handling listener
 * methods to any class
 *
 * This is an abstract class that is not aware of
 * event types
 *
 * @constructor
 */
ss.Events = function ()
{
  try {
    /**
     * Our local db
     *
     * @type {Object}
     * @private
     */
    this._eventsdb = {
      hasEvents: false,
      /**
         * This array will contain listener objects
         * which have the following keys:
         * type: {string} // the type of the listener
         * listener: {Function} // the listener function
         * this: {this} // the context we will run the method on
         */
      listeners: new Array()

    };

  } catch(e) {
    ss.error(e);
  }

}; // class ss.Events

/**
 * Adds an event listener for the specified type
 *
 * @param {string} type The type of the listener. An arbitrary unique string
 * @param {Function} listener The listening function
 * @param {this=} opt_this Optional this context to run the listener on
 * @param {string=} opt_id Optional id for listener (easy removal) use unique names
 * @return {void}
 */
ss.Events.prototype.addEventListener = function (type, listener, opt_this, opt_id)
{
  try {
    if (!goog.isFunction(listener)) {
      return;
    }

    // turn on events switch
    this._eventsdb.hasEvents = true;

    // prepare listener object
    var listObj = {
      type: type,
      runOnce: false,
      listener: listener,
      _this: opt_this || goog.global,
      _id : opt_id || null
    };
    // push to listeners array
    this._eventsdb.listeners.push(listObj);

  } catch(e) {
    ss.error(e);
  }

}; // ss.Events.addEventListener


/**
 * Adds an event listener for the specified type
 *
 * This event will execute only once
 *
 * @param {string} type The type of the listener
 * @param {Function} listener The listening function
 * @param {_this=} opt_this Optional this context to run the listener on
 * @return {void}
 */
ss.Events.prototype.addEventListenerOnce = function (type, listener, opt_this)
{
  try {
    var logger = goog.debug.Logger.getLogger('ss.Events.addEventOnce');

    if (!goog.isFunction(listener)) {
      logger.warning('listener is not a function for type:' + type);
      return;
    }

    // turn on events switch
    this._eventsdb.hasEvents = true;

    // prepare listener object
    var listObj = {
      type: type,
      runOnce: true,
      listener: listener,
      _this: opt_this || g.global
    };

    // push to listeners array
    this._eventsdb.listeners.push(listObj);

  } catch(e) {
    ss.error(e);
  }

}; // ss.Events.addEventOnce


/**
 * Removes an event listener for the specified type
 * and specific listener
 *
 * @param {string} type The type of the listener
 * @param {Function|string} listener The listening function or the ID of the
 *      listener if we had set one...
 * @return {void}
 */
ss.Events.prototype.removeEventListener = function (type, listener)
{
  try {
    if (!this._eventsdb.hasEvents) {
      return;
    }

    // init required vars
    var found = false;
    var foundIndex = null;
    // check if listener is function or string
    if (goog.isFunction(listener)) {

      // try to locate it
      goog.array.forEach(this._eventsdb.listeners, function(listObj, index){
        // check if same type
        if (listObj.type == type) {
          // check if same listener
          if (listObj.listener == listener) {
            // great we found a listener
            //logger.info('Found listener at index:' + index);
            found = true;
            foundIndex = index;
          }
        }
      }, this);
    } else if (goog.isString(listener)) {
      // we have a string (ID)
      goog.array.forEach(this._eventsdb.listeners, function(listObj, index){
        if (listObj.type == type) {
          if (listObj._id == listener) {
            // found it...
            //logger.info('Found listener at index:' + index);
            found = true;
            foundIndex = index;
          }
        }
      }, this);
    } else {
      return;
    }
    if (found) {
      // remove it
      goog.array.removeAt(this._eventsdb.listeners, foundIndex);
    }

    // check if we are out of listeners
    if (0 == this._eventsdb.listeners.length)
      this._eventsdb.hasEvents = false;

  } catch(e) {
    ss.error(e);
  }

}; // ss.Events.removeEvent

/**
 * Clears all listeners
 *
 * @return {void}
 * @private
 */
ss.Events.prototype._clearListeners = function ()
{
  this._eventsdb.listeners = new Array();
  this._eventsdb.hasEvents = false;
}; // ss.Events._clearListeners



/**
 * Trigger an event
 *
 * @param {string} type The type of event to trigger
 * @param {...*=} opt_var_args Additional arguments that are partially
 *     applied to listeners.
 * @return {void}
 * @private
 */
ss.Events.prototype._runEventType = function(type, opt_var_args)
{
  try {
    // check if no events
    if (!this._eventsdb.hasEvents)
      return;

    // look for the triggered event in the events object
    var ev = ss.arFind(this.events, 'type', type);

    var args = Array.prototype.slice.call(arguments, 1);

    var removeListeners = [];
    // loop through the listeners object
    goog.array.forEach(this._eventsdb.listeners, function(listObj, index){
      if (listObj.type == type) {
        // Prepend the bound arguments to the current arguments.
        var newArgs = Array.prototype.slice.call(arguments);
        newArgs.unshift.apply(newArgs, args);
        // call the listener
        listObj.listener.apply(listObj._this, newArgs);
        // check if we need to remove this cause of runOnce
        if (listObj.runOnce)
          removeListeners.push(index);
      }
    }, this);

    // now remove any listeners that were to run once...
    var substractIndex = 0;
    goog.array.forEach(removeListeners, function (listIndex, index){
      goog.array.removeAt(this._eventsdb.listeners, listIndex - substractIndex);
      substractIndex++;
    }, this);

  } catch(e) {
    ss.error(e);
  }
}; // method ss.Events._runEventType


/**
 * Trigger an event (public method)
 *
 * @param {string} type The type of event to trigger
 * @param {...*=} opt_var_args Additional arguments that are partially
 *     applied to listeners.
 * @return {void}
 */
ss.Events.prototype.runEvent = ss.Events.prototype._runEventType;



