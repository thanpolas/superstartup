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
*  Handles all page/windows state / functionality
*  createdate 16/Dec/2009 
*
*/



goog.provide('web.ui');

goog.require('web.ui.alert');
goog.require('web.ui.bottomScroll');
goog.require('web.ui.mobile');
goog.require('web.ui.dialogs');


web.ui.db = {
  fbClicked: false,
  resize: new Array(),
  /**
   * set this switch to true if footerInit runs when user
   * was authed, to prevent running again...
   */
  footSetandAuthed: false
};

/**
 * Executes hard coded from web.Init
 *
 * Initializes core UI elements and events
 *
 * @return {void}
 */
web.ui.INIT = function ()
{
  var j = $;
  var w = web, c = core, g = goog;

  var log = c.log('web.ui.INIT');

  log.info('Init');

  // perform initial resize
  w.ui.resize();
  // setup resize global listener for our app
  j(window).smartresize(function(){
    w.ui.resize();
  });

  // start loading twitter's widgets after 500ms
  setTimeout(function(){
    var twString = '<script src="http://platform.twitter.com/widgets.js" type="text/javascript"></script>';
    j('body').append(twString);

    // start init cycle for our twitter lib
    c.twit.Init();

  }, 500);



};






/**
 * Will fetch an ID stored in an element as a css class
 *
 * We expect a jQuery element and the prefix we want
 * to extract the id from
 * e.g. cssId(jQ, '_spid_')
 * will return r42F4 if the element has a class named:
 * _spid_r42F4
 *
 * @param {array} jQel jQuery element
 * @param {string} prefix of css
 * @return {string|boolean} false if fail / not found
 */
web.ui.cssId = function (jQel, prefix)
{

  var g = goog, c = core;
  var log = g.debug.Logger.getLogger('web.ui.cssId');

  if (!c.isjQ(jQel))
    return false;

  // get the DOM element and check if it's there
  var el = jQel[0];
  if (!g.isObject(el))
    return false;


  // get all element's classes...
  var arClasses = el.className.split(" ");
  // now look for prefixed class
  if (!g.isArray(arClasses)) {
    log.severe('arClasses is not an array');
    return false;
  }

  var found = false;
  var objId = null;

  g.array.forEach(arClasses, function(itemClass, index){
    // check for prefix
    if (prefix == itemClass.substr(0,prefix.length)) {
      // found it!
      found = true;
      objId = itemClass.substr(prefix.length);
    }
  });

  if (found)
    return objId;

  // not found
  return false;
}; // method web.ui.cssId



/**
 * Gets window real estate and returns the values in a simple object
 * obj.width / obj.height
 *
 * code from: http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
 *
 * @return object
 */
//
web.ui.getWindowRes = function ()
{
  //
  var winWidth = 0, winHeight = 0;
  if( typeof( window.innerWidth ) == 'number' ) {
    //Non-IE
    winWidth = window.innerWidth;
    winHeight = window.innerHeight;
  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
    //IE 6+ in 'standards compliant mode'
    winWidth = document.documentElement.clientWidth;
    winHeight = document.documentElement.clientHeight;
  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
    //IE 4 compatible
    winWidth = document.body.clientWidth;
    winHeight = document.body.clientHeight;
  }
  return {
    height:winHeight,
    width:winWidth
  };
};

/**
 * Will resize all page elements that need be resized
 *
 * We will calculate the web.ui.winsizes data object
 *
 * Resize the core elements of the page if web.ui.db.doresize
 *   allows us to
 *
 * And loop through all resize hooks we have
 *
 * @return {void}
 */
web.ui.resize = function ()
{
  var w = web;
  var ui = w.ui;
  var g = goog;
  var log = g.debug.Logger.getLogger('web.ui.resize');
  //var cp = s.conf.page;
  var j = $;
  log.fine('Init - Resize event just fired');



  // This code was html inline, fixes main window sizes
  //var height = j(window).height();

  //if (height > 520)
   // j('#home_master').css('height', height + 'px');
    //document.getElementById('home_master').style.height=a+'px';

  // calculate height for main chat window
  //a = height-80-56-55;
  //j('#main').css('height', a + 'px');
  //document.getElementById('main').style.height=a+'px';
  var win = window;
  var height = j(win).height();
  var width = j(win).width();
  var r = w.ui.db.resize;
  // execute any listening functions
  w.ui.resizeEvent.runEvent('resize', {width:width, height:height});

  if (w.SFV) {
    //j('#sfv_all_frames').css('height', (height - 80 - 81) + 'px');
  } else {
    // 3b Aug/12/11 no longer needed inline scroll, we now scroll the hole page
    //j('#main').css('height', (height - 80 - 81) + 'px');

    // calculate position for camera
    if (!w.webcam.isCameraOn()) {
      j("#chatbox_videofeed").css('left', Math.abs(width / 2) - 110);
    }
  }


  return;
  // get window size
  var size = ui.getWindowRes();

  // assign window size to our local winSizes db
  w.win.width = size.width;
  w.win.height = size.height;

  // we need to resize the main chat area...


  return;

}; // method resize

/**
 * We hook functions to the resize event.
 *
 * Each function we hook gets called with an object
 * containing these keys: height width
 *
 * This function also executes (initialises) the listener
 * once
 *
 *
 * @param {function} fn The function to callback
 * @return {void}
 * @depricated Use web.ui.resizeEvent
 */
web.ui.resizeHook = function (fn)
{
  web.ui.resizeEvent.addEventListener('resize', fn);
}; // method web.ui.resizeHook

/**
 * Create a new instance of the events listeners class
 * to use for resize events.
 *
 * Attach to this instance.
 * Events triggered:
 * resize :: {width:Number, height:Number}
 *
 */
web.ui.resizeEvent = new core.events.listeners();

/**
 * Will set the page title
 *
 * @param {string} title The title
 * @return void
 */
web.ui.setTitle = function (title)
{
  document.title = title;
};



