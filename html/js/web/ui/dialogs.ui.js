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
 * created on Jul 2, 2011
 * dialogs.ui.js Common dialogs
 *
 */


goog.provide('web.ui.dialogs');

web.ui.dialogs.db = {
  yesnoInit: false
}



/**
 * Binds for keystrokes on document
 *
 * @param {type}  description
 * @return {void}
 */
web.ui.dialogs.Init = function ()
{
  try {
    var w = web, j = $, c = core;
    if (!w.BOOTH)
      return;
    var log = c.log('web.ui.dialogs.Init');

    log.info('Init');
    j(document).keyup(function(e) {
      if (e.keyCode == 27) {
        w.ui.dialogs.events.runEvent('esckey');
      }
    });

  } catch (e) {core.error(e);}

}; // web.ui.dialogs.Init

core.ready.addFunc('main', web.ui.dialogs.Init, 200);


/**
 * We support one type of event:
 * esckey :: esc key pressed
 *
 */
web.ui.dialogs.events = new core.events.listeners();


/**
 * Display a standard Yes / No dialogue
 *
 * @param {string} message Message to print
 * @param {Function(boolean)} listener callback function with responce
 * @return {void}
 */
web.ui.dialogs.yesNo = function (message, listener)
{
  try {
    var j = $, w = web;
    j("#dialog_yesno").dispOn();

    j("#dialog_yesno .dialog_message").text(message);

    // if first ever time, setup listeners
    if (!w.ui.dialogs.db.yesnoInit) {
      w.ui.dialogs.db.yesnoInit = true;
      j('._dialog_yes').click(function(){_close(true)});
      j('._dialog_no').click(function(){_close(false)});
      j('#dialog_yesno .overlay_x').click(function(){_close(false)})
    }

    function _close (state) {
      j("#dialog_yesno").dispOff();
      listener(state);
    }

  } catch (e) {
    core.error(e);
  }

};



/**
 * Fixes scrolling issues for modals
 *
 * Because some modals are position absolute, if
 * visitor is scrolled down, when clicking we need to
 * set the top position so the modal is visible...
 *
 * We do the same when user scrolls out of the modal in
 * either direction...
 *
 * @param {jQuery} jQ The master overlay jQuery array
 * @param {boolean=} opt_nochildren if set to true we don't use the
 *      passed JQ children, rather we use the JS itself
 * @return {void}
 */
web.ui.dialogs.fixScroll = function (jQ, opt_nochildren)
{
  try {
    var w = web, j = $, c = core, g = goog;

    //var log = c.log('web.ui.dialogs.fixScroll');

    //log.info('Init:' + jQ.attr('id'));

    // if in mobile mode don't execute
    if (w.MOB)
      return;

    // get current viewport
    var vp = w.ui.mobile.getViewport();
    // get overlay content box
    if (opt_nochildren)
      var jQBox = jQ;
    else
      var jQBox = jQ.children().first();
    // calculate top margin
    var marTop = vp.top + 30; // 30 for grace
    jQBox.css('margin-top', marTop);
  } catch (e) {
    core.error(e);
  }

}; // web.ui.dialogs.fixScroll


/**
 * Adds closing events to an overlay (modal)
 *
 * Use this function every time the modal opens
 *
 * @param {jQuery} jQ Master overlay jQuery element
 * @param {Function=} opt_cb Callback function when close event fires
 * @return {void}
 */
web.ui.dialogs.addCloseEvents = function (jQ, opt_cb)
{
  try {
    var w = web, j = $;



    var fclose = opt_cb || function() {jQ.dispOff();};

    jQ.click(function(e){
      try {
        if (jQ.attr('id') == j(e.target).attr('id')) {

          fclose();
          // remove bindings
          jQ.unbind('click');
          w.ui.dialogs.events.removeEventListener('esckey', jQ.attr('id'));
        }
      } catch (e) {
        core.error(e);
      }
    });

    // add listener for esc keypress
    w.ui.dialogs.events.addEventListener('esckey', function(){
      fclose();
      // remove bindings
      jQ.unbind('click');
      w.ui.dialogs.events.removeEventListener('esckey', jQ.attr('id'));
    }, null, jQ.attr('id'));

  } catch (e) {
    core.error(e);
  }

}; // web.ui.dialogs.addCloseEvents


/**
 * Sets proper height to new opening overlay elements
 *
 * We actually set the height of the overlay to match
 * window's height
 *
 * @param {jQuery} jQ The jQuery element to set height
 * @return {void}
 */
web.ui.dialogs.overlayHeight = function (jQ)
{
  try {
    var j = $;
    jQ.height(j('body').height());
  } catch (e) {
    core.error(e);
  }

}; // web.ui.dialogs.overlayHeight

