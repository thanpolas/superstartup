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
 *
 *
*  Handles all page/windows state / functionality
*  createdate 16/Dec/2009 
*
*/



goog.provide('ss.web.ui');

goog.require('ss.web.ui.alert');


ss.web.ui.db = {
  fbClicked: false,
  resize: new Array(),
  /**
   * set this switch to true if footerInit runs when user
   * was authed, to prevent running again...
   */
  footSetandAuthed: false
};

/**
 * Executes hard coded from ss.web.Init
 *
 * Initializes ss UI elements and events
 *
 * @return {void}
 */
ss.web.ui.INIT = function ()
{
  var win = window, j = $, c = ss, w = c.web;

  var log = c.log('ss.web.ui.INIT');

  log.info('Init');

  // perform initial resize
  w.ui.resize();
  // setup resize global listener for our app
  j(win).smartresize(function(){
    w.ui.resize();
  });





};

/**
 * Gets window real estate and returns the values in a simple object
 * obj.width / obj.height
 *
 * code from: http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
 *
 * @return object
 */
//
ss.web.ui.getWindowRes = function ()
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
 * We will calculate the ss.web.ui.winsizes data object
 *
 * Resize the ss elements of the page if ss.web.ui.db.doresize
 *   allows us to
 *
 * And loop through all resize hooks we have
 *
 * @return {void}
 */
ss.web.ui.resize = function ()
{
  var win = window, j = $, c = ss, w = c.web, g = goog;
  var log = g.debug.Logger.getLogger('ss.web.ui.resize');
  //var cp = s.conf.page;
  
  log.fine('Init - Resize event just fired');

  var height = j(win).height();
  var width = j(win).width();

  // execute any listening functions
  w.ui.resizeEvent.runEvent('resize', {width:width, height:height});

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
 * @depricated Use ss.web.ui.resizeEvent
 */
ss.web.ui.resizeHook = function (fn) {
  ss.web.ui.resizeEvent.addEventListener('resize', fn);
}; // method ss.web.ui.resizeHook

/**
 * Create a new instance of the events listeners class
 * to use for resize events.
 *
 * Attach to this instance.
 * Events triggered:
 * resize :: {width:Number, height:Number}
 *
 */
ss.web.ui.resizeEvent = new ss.events.listeners();

/**
 * Will set the page title
 *
 * @param {string} title The title
 * @return void
 */
ss.web.ui.setTitle = function (title) {
  document.title = title;
};



