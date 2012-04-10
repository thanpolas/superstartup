/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
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


goog.provide('core.events');
goog.provide('core.events.listeners');

/**
 * Will provide event handling listener
 * methods to any class
 *
 * This is an abstract class that is not aware of
 * event types
 *
 * @constructor
 */
core.events.listeners = function ()
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
    core.error(e);
  }

}; // class core.events.listeners

/**
 * Adds an event listener for the specified type
 *
 * @param {string} type The type of the listener. An arbitrary unique string
 * @param {Function} listener The listening function
 * @param {this=} opt_this Optional this context to run the listener on
 * @param {string=} opt_id Optional id for listener (easy removal) use unique names
 * @return {void}
 */
core.events.listeners.prototype.addEventListener = function (type, listener, opt_this, opt_id)
{
  try {

    var w = core;
    var g = goog;
    var log = w.log('core.events.listeners.addEvent');

    if (!g.isFunction(listener)) {
      log.warning('listener is not a function for type:' + type);
      return;
    }



    // turn on events switch
    this._eventsdb.hasEvents = true;

    // prepare listener object
    var listObj = {
      type: type,
      runOnce: false,
      listener: listener,
      _this: opt_this || g.global,
      _id : opt_id || null
    }

    // push to listeners array
    this._eventsdb.listeners.push(listObj);

  } catch(e) {
    core.error(e);
  }

}; // core.events.listeners.addEventListener


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
core.events.listeners.prototype.addEventListenerOnce = function (type, listener, opt_this)
{
  try {

    var w = core;
    var g = goog;
    var log = w.log('core.events.listeners.addEventOnce');

    if (!g.isFunction(listener)) {
      log.warning('listener is not a function for type:' + type);
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
    }

    // push to listeners array
    this._eventsdb.listeners.push(listObj);

  } catch(e) {
    core.error(e);
  }

}; // core.events.listeners.addEventOnce


/**
 * Removes an event listener for the specified type
 * and specific listener
 *
 * @param {string} type The type of the listener
 * @param {Function|string} listener The listening function or the ID of the
 *      listener if we had set one...
 * @return {void}
 */
core.events.listeners.prototype.removeEventListener = function (type, listener)
{
  try {

    var w = core;
    var g = goog;
    var log = w.log('core.events.listeners.removeEvent');

    log.info('Init. type:' + type);

    if (!this._eventsdb.hasEvents) {
      log.warning('this._eventsdb.hasEvents is FALSE');
      return;
    }

    // init required vars
    var found = false;
    var foundIndex = null;
    // check if listener is function or string
    if (g.isFunction(listener)) {

      // try to locate it
      g.array.forEach(this._eventsdb.listeners, function(listObj, index){
        // check if same type
        if (listObj.type == type) {
          // check if same listener
          if (listObj.listener == listener) {
            // great we found a listener
            //log.info('Found listener at index:' + index);
            found = true;
            foundIndex = index;
          }
        }
      }, this);
    } else if (g.isString(listener)) {
      // we have a string (ID)
      g.array.forEach(this._eventsdb.listeners, function(listObj, index){
        if (listObj.type == type) {
          if (listObj._id == listener) {
            // found it...
            //log.info('Found listener at index:' + index);
            found = true;
            foundIndex = index;
          }
        }
      }, this);
    } else {
      log.warning('listener is not a function or a string:' + listener);
      return;
    }
    if (found) {
      // remove it
      goog.array.removeAt(this._eventsdb.listeners, foundIndex);
    } else {
      log.warning('Listener not found');
    }

    // check if we are out of listeners
    if (0 == this._eventsdb.listeners.length)
      this._eventsdb.hasEvents = false;

  } catch(e) {
    core.error(e);
  }

}; // core.events.listeners.removeEvent

/**
 * Clears all listeners
 *
 * @return {void}
 * @private
 */
core.events.listeners.prototype._clearListeners = function ()
{
  this._eventsdb.listeners = new Array();
  this._eventsdb.hasEvents = false;
}; // core.events.listeners._clearListeners



/**
 * Trigger an event
 *
 * @param {string} type The type of event to trigger
 * @param {...*=} opt_var_args Additional arguments that are partially
 *     applied to listeners.
 * @return {void}
 * @private
 */
core.events.listeners.prototype._runEventType = function(type, opt_var_args)
{
  try {
    var g = goog;
    var c = core;
    var log = c.log('core.events.listeners._runEventType');

    log.finer('Init. type:' + type + ' total listeners:' + this._eventsdb.listeners.length);

    // check if no events
    if (!this._eventsdb.hasEvents) return;
    
    // look for the triggered event in the events object
    var ev = c.arFind(this.events, 'type', type);


    var args = Array.prototype.slice.call(arguments, 1);



    var removeListeners = [];
    // loop through the listeners object
    g.array.forEach(this._eventsdb.listeners, function(listObj, index){
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
    g.array.forEach(removeListeners, function (listIndex, index){
      g.array.removeAt(this._eventsdb.listeners, listIndex - substractIndex);
      substractIndex++;
    }, this);

  } catch(e) {
    core.error(e);
  }
}; // method core.events.listeners._runEventType


/**
 * Trigger an event (public method)
 *
 * @param {string} type The type of event to trigger
 * @param {...*=} opt_var_args Additional arguments that are partially
 *     applied to listeners.
 * @return {void}
 */
core.events.listeners.prototype.runEvent = core.events.listeners.prototype._runEventType;



