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
 *********                                                                                
 * createdate 14/Dec/2009
 * jQuery Extensions 
 */

goog.provide('ss.web.jq.ext');


/**
 *
 *  // usage:
 * $(window).smartresize(function(){
 *   // code that takes it easy...
 * });
 *
 * Code from http://paulirish.com/2009/throttled-smartresize-jquery-event-handler/
 */
(function($,sr){

  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function (func, threshold, execAsap) {
      var timeout;

      return function debounced () {
          var obj = this, args = arguments;
          function delayed () {
              if (!execAsap)
                  func.apply(obj, args);
              timeout = null;
          };

          if (timeout)
              clearTimeout(timeout);
          else if (execAsap)
              func.apply(obj, args);

          timeout = setTimeout(delayed, threshold || 100);
      };
  }
    // smartresize
    jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

})(jQuery,'smartresize');




/**
 * .dispOn() :: == .css("display", "block")
 *
 * @return {void}
 */
ss.web.jq.ext.dispOn = function()
{
    var j = $;
    return this.each(function()
    {
        j(this).css("display", "block");
        // set state of element
        j(this).data('closed', false);

    });
}; // method ss.web.jq.ext.dispOn

/**
 * .dispOff() :: == .css("display", "none")
 *
 * @return {void}
 */
ss.web.jq.ext.dispOff = function()
{
    var j  = $;
    return this.each(function()
    {
        j(this).css("display", "none");
        // set state of element
        j(this).data('closed', true);
    });
}; // method ss.web.jq.ext.dispOff

/**
 * .del(callback) :: Performs a custom remove(), optionaly we can set a callback
 * Will remove an element with our remove effect.
 * [To be desided whitch, for now pulsate]
 *
 * @param {function} callback
 * @return void
 */
ss.web.jq.ext.del = function(callback)
{

    $(this).effect('pulsate', {}, 250, function() {
        //$(this).slide(false, function() {
            $(this).remove();
            if (undefined != callback)
                callback();
        //});

    });
    return $(this);
}; // method ss.web.jq.ext.

/**
 * .slide(refreshHeight) :: Performs a slideUp/Down depending on status.
 *
 * ss code from: http://jqueryfordesigners.com/slidedown-animation-jump-revisited/
 *
 * @param {boolean|function=} opt_refreshHeight is optional, if set to true we will force refresh the truHeight
 * @param {function=} opt_callback Call Back function, assign as first parameter as well
 * @return {void}
 */
ss.web.jq.ext.slide = function(opt_refreshHeight, opt_callback)
{
    var g = goog;
    var log = g.debug.Logger.getLogger('ss.web.jq.ext.slide');
    var j = $;

    log.fine('Init for:' + this.selector + ' closed:' + j(this).data('closed') + ' callId:' + j(this).data('callId'));

    //set the duration of the effect
    var time = 200;


    var refreshHeight = false;
    if (g.isBoolean(opt_refreshHeight))
        refreshHeight = opt_refreshHeight;

    // set callback
    var callback = opt_callback || function(){};
    if (g.isFunction(opt_refreshHeight))
        callback = opt_refreshHeight;
    // store callback into DOM element
    // in efect overwriting any previous
    // callbacks for this element
    j(this).data('callback', callback);


    // check if we have a call ID
    var callId = j(this).data('callId');
    if (!g.isNumber(callId)) {
        // first time
        callId = 1;
    } else {
        // been here before, add up the ID
        callId += 1;
    }
    // store back the new callId
    j(this).data('callId', callId);

    // validate closed element var
    if (!g.isBoolean(j(this).data('closed')))
        j(this).data('closed', j(this).off());

    log.fine('callId of element:' + callId);

    // check if animation is already running
    if (j(this).data('animation')) {
        log.fine('animation is on exiting');
        return;
    }

    if (!j(this).data('closed'))
    {
        log.fine('element was on. Closing...');
        // we have to close the control
        //store height again
        j(this).data('truHeight', j(this).height());

        // mark animation start
        j(this).data('animation', true);

        log.finer('performing animation to height 0. time:' + time);

        // perform animation
        j(this).animate({height:0}, time, 'linear', function() {
            // when animation finishes...
            log.fine('animation Finished. callId of element:' + callId + ' jQ callId:' + j(this).data('callId'));
            j(this).dispOff();
            j(this).data('callback')(this); // callback(this);
            // mark animation stop
            j(this).data('animation', false);
        });
    }
    else {
        log.fine('element was off. Opening...');
        // Need to open the control

        //get truHeight var from object
        var truHeight = j(this).data('truHeight');
        log.finer('Height Before Calculations -> truHeight:' + truHeight);
        if (undefined == truHeight || refreshHeight)
        {
            j(this).dispOn();

            truHeight = j(this).height();
            j(this).dispOff();
            j(this).data('truHeight', truHeight);
        } //if truHeight is undefined
        log.finer('Height After Calculations -> truHeight:' + truHeight);
        j(this).css({ height : 0 });

        // mark animation start
        j(this).data('animation', true);
        log.finer('performing animation to height:' + truHeight + ' time:' + time);
        j(this).animate({ height : truHeight }, time, 'linear', function() {
            log.fine('animation finished: callId of element:' + callId + ' jQ callId:' + j(this).data('callId'));
            j(this).dispOn();
            j(this).data('callback')(this);
            // mark animation stop
            j(this).data('animation', false);

        });

    } // else we need to close it
}; // method ss.web.jq.ext.slide

(function($){
/**
 * Use our methods to extend jQuery
 */
    var j = ss.web.jq.ext;
    $.fn.extend(
    {
        //msgBox: j.msgbox,
        dispOn: j.dispOn,
        dispOff: j.dispOff,
        on: j.on,
        off: j.off,
        del: j.del,
        slide: j.slide
    });
})(jQuery);

