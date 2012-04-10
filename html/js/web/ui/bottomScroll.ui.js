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
 *
 *
*
*********
* createdate 23/Nov/2010
* Auto scroll on bottom (load more content)
*/

goog.provide('web.ui.bottomScroll');
goog.require('core.events.listeners');


/**
 * Will open autoscroll for bottom
 *
 * Attach to the 'bottom' event
 * bscroll.addEvent('bottom', fn);
 *
 * @constructor
 * @param {jQuery=} opt_jQ optional set the jQuery object we will watch
 * @param {jQuery=} opt_jQHeight This is the object that will hold the total height
 *      that we use as indicator for our events
 * @extends {core.events.listeners}
 */
web.ui.bottomScroll = function (opt_jQ, opt_jQHeight)
{
    try {
    var w = core;
    var s = web;
    var _this = this;

    w.events.listeners.call(this);

    this.db = {
      jQscroll: (opt_jQ ? opt_jQ : window),
      jQHeight: (opt_jQHeight ? opt_jQHeight : window)
    }

    // check if we are constructed
    if (!s.ui.bottomScroll.staticDB.constructed)
        s.ui.bottomScroll._construct.call(this);


    // attach ourselves to the bottom scroll event

    s.ui.bottomScroll.staticDB.currentListener = function (){
        _this._runEventType('bottom');
    }


    // since we were inited we want to listen to scroll
    // open the switch.
    // This switch is reset in: web.ui.hideElements()
    this.on();

    } catch(e){core.error(e);}
};// web.ui.bottomScroll
goog.inherits(web.ui.bottomScroll, core.events.listeners);


/**
 * The static data object hash of
 * our class
 *
 * @type {Object}
 */
web.ui.bottomScroll.staticDB = {
    constructed: false,
    listenOn: false,
    currentListener: function (){}
}; // web.ui.bottomScroll.staticDB




/**
 * Construct the window scroll listener once per page
 * load
 *
 * @private
 * @return {void}
 */
web.ui.bottomScroll._construct = function ()
{
    try {
    var j = $;
    var w = web;
    var g = goog;

    // set the scroll event listener
    j(this.db.jQscroll).scroll(g.bind(function() {
      try {


        if (!w.ui.bottomScroll.staticDB.listenOn)
            return;

        // Measure our Bottom by adding up the main element's height to our scrollTop
        var scrollTop = this.db.jQscroll.height() + this.db.jQscroll.scrollTop();
        // add some breathing space
        scrollTop += 30;
        if (scrollTop > this.db.jQHeight.height()) {
          w.ui.bottomScroll.staticDB.currentListener();
        }

        //if (j(this.db.jQscroll).scrollTop() > j(this.db.jQscroll).height() - j(this.db.jQscroll).height() - 30) {

          //
        //}
      } catch (e) {
        core.error(e);
      }

    }, this));

    // open the constructed switch
    w.ui.bottomScroll.staticDB.constructed = true;

    } catch(e){core.error(e);}

}; // web.ui.bottomScroll.prototype._construct

/**
 * Turn off bottom scrolling event watch
 *
 * @return {void}
 */
web.ui.bottomScroll.prototype.off = function ()
{
    web.ui.bottomScroll.staticDB.listenOn = false;
}; // web.ui.bottomScroll.prototype.off

/**
 * Turn on bottom scrolling event watch
 *
 * @return {void}
 */
web.ui.bottomScroll.prototype.on = function ()
{
    web.ui.bottomScroll.staticDB.listenOn = true;
}; // web.ui.bottomScroll.prototype.on

