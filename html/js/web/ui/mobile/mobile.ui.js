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
 * @copyright  (C) 2000-2010 Athanasios Polychronakis - All Rights Reserved
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 *
 *
 *
 *********
 * created on Aug 13, 2011
 * mobile.ui.js Functions for mobile visitors
 *
 */


goog.provide('web.ui.mobile');


/**
 * We support one type of event:
 * change
 *
 * For viewport change, either by scrolling or resizing
 *
 * We run the event with one parameter, the values of
 * the web.ui.mobile.getViewport() function
 *
 */
web.ui.mobile.events = new core.events.listeners();

/**
 * Triggers from TagLanderParse when we know we have a mobile client
 *
 * @return {void}
 */
web.ui.mobile.Init = function ()
{
  try {
    var w = web, c = core;

    var log = c.log('web.ui.mobile.Init');

    log.info('Init');

    // First off catch the scrolling event to fix the
    // position:fixed issue
    w.ui.mobile.posFixedFix();


  } catch (e) {
    core.error(e);
  }

}; // web.ui.mobile.Init


/**
 * Fixes the position:fixed problem with mobile devices (they don't respect it)
 *
 * So what we do is listen for the scroll event, make the fixed elements
 * (header, footer) dissapear and have them appear repositioned after
 * the scrolling stops...
 *
 * @return {void}
 */
web.ui.mobile.posFixedFix = function ()
{
  try {
    var w = web, j = $, g = goog;

    var jheader = j('#top');
    if (w.SFV)
      var jfooter = null;
    else
      var jfooter = j('#foot');
    var jfineprint = j('.foot_fine_print');

    // how many seconds to set the timeout where position show
    // will happen...
    var throttle = 100;
    var timeout = null;


    // Code from borjo for smooth scrolling... Don't use it yet...
    /*
    if(w.ui.mobile.isTouchDevice()){ //if touch events exist...
      var el = j(window)[0];
      var scrollStartPos = 0;

      el.addEventListener("touchstart",
        function(event) {
          scrollStartPos = this.scrollTop + event.touches[0].pageY;
          event.preventDefault();
          jheader.dispOff();

      },false);

      el.addEventListener("touchmove",
        function(event) {
          this.scrollTop = scrollStartPos - event.touches[0].pageY;
          event.preventDefault();
      },false);
    }
    */



    // sample code from:
    // view-source:http://www.quirksmode.org/m/tests/devicefixed.html

    var el = jfooter[0];

    if (!w.SFV) {
      jfooter.css('position', 'absolute');
      jfineprint.css('position', 'absolute');
    }
    jheader.css('position', 'absolute');


    var win = window;
    win.onresize = win.onscroll = function () {
      // get the viewport values
      var vport = w.ui.mobile.getViewport();
      // set the top of the fixed elements
      if (!w.SFV) {
        jfooter.css('top', vport.lowerLeft - el.offsetHeight + 'px');
        jfineprint.css('top', vport.lowerLeft - 20 + 'px');
      }
      jheader.css('top', win.pageYOffset + 'px');


      // run any other attached listeners
      w.ui.mobile.events.runEvent('change', vport);

    }
    // run once to make proper
    win.onscroll();

return;



    // bind on scrolling event
    j(window).scroll(function(){
      try {

        // simply reposition the elements, this event fires
        // after the scrolling event is finished so no need for start/end

        var mainOfst = j("#main").offset();
        jfooter.css('bottom', 0);
        jheader.css('top', mainOfst.top);


        return;

        jfooter.dispOff();
        jheader.dispOff();

        // clear any previous timeouts and re-set them
        if (!g.isNull(timeout))
          clearTimeout(timeout);
        timeout = setTimeout(function(){
          try {
            // Scrolling has ENDED, make elements re-appear
            jfooter.dispOn();
            jheader.dispOn();
          } catch (e) {
            core.error(e);
          }

        }, throttle);

      } catch (e) {
        core.error(e);
      }

    })

  } catch (e) {
    core.error(e);
  }

}; // web.ui.mobile.posFixedFix

/**
 * Let's us know if the device is a touch device
 * like iPad / iPhone
 *
 * @return {boolean}
 */
web.ui.mobile.isTouchDevice = function()
{
  try{
    document.createEvent("TouchEvent");
    return true;
  }catch(e){
    return false;
  }
};



/**
 * Will return coordinates of the current user viewport
 * Object returned contains these keys:
 * top: The top of the viewport
 * left: The left of the viewport
 * height: The height of the viewport
 * width: The width of the viewport
 * lowerLeft: Bottom left (top + height) for bottom fixed pos
 * zoomFactor: The current zoom factor of the device
 *
 * @return {object}
 */
web.ui.mobile.getViewport = function ()
{
  try {
    var win = window;
    return {
      top: win.pageYOffset,
      left: win.pageXOffset,
      height: win.innerHeight,
      width: win.innerWidth,
      lowerLeft: win.pageYOffset + win.innerHeight,
      zoomFactor: win.innerWidth / document.documentElement.clientWidth
    };
  } catch (e) {
    core.error(e);
  }

};

/**
 * Helper function for fixing top fixed elements
 *
 * We wrap around our event listener, no local data kept
 *
 * @param {jQuery} jEl The element we want to have fixed on top
 * @param {string} unique_id A unique ID
 * @return {void}
 */
web.ui.mobile.fixedTop = function (jEl, unique_id)
{
  try {
    var w = web, c = core;

    var log = c.log('web.ui.mobile.fixedTop');
    log.info('Init:' + unique_id);
    // get viewport dimentions and reset element's position style and top
    var vport = w.ui.mobile.getViewport();
    jEl.css('position', 'absolute');
    jEl.css('top', vport.top + 'px');
    // now listen for scroll/resize events and reposition element
    w.ui.mobile.events.addEventListener('change', function(vport){
      jEl.css('top', vport.top + 'px');
    }, null, unique_id);
  } catch (e) {core.error(e);}

}; // web.ui.mobile.fixedTop

/**
 * Removes a fixed top watch
 *
 * @param {type} unique_id description
 * @return {void}
 */
web.ui.mobile.fixedTopRemove = function (unique_id)
{
  try {
    var w = web, c = core;

    var log = c.log('web.ui.mobile.fixedTopRemove');

    log.info('Init:' + unique_id);
    w.ui.mobile.events.removeEventListener('change', unique_id);
  } catch (e) {
    core.error(e);
  }

}; // web.ui.mobile.fixedTopRemove


