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
 *
 *********
 * createdate 30/Apr/2011
 *
 */

goog.provide('ss.web');
goog.require('ss');
goog.require('ss.web.system');
goog.require('ss.web.cookies');
goog.require('ss.web.jq.ext');

goog.require('ss.web.user');



goog.require('goog.debug');
goog.require('goog.debug.FancyWindow');
goog.require('goog.debug.Logger');
goog.require('goog.debug.LogManager');


// Add your required files from here on...
goog.require('ss.web.myapp');




/**
 * Our global variables
 *
 * @type {Object}
 */
ss.web.db = {
  fbClicked: false
};

/**
 * If visitor is accessing our page from a mobile device
 *
 * @type {boolean}
 */
ss.web.MOB = false;



/**
 * The main initialiser for web
 * Triggers when we have a DOCUMENT READY event from DOM
 *
 * @return {void}
 */
ss.web.onDomReady = function () 
{
  var log = ss.log('ss.web.INIT');

  log.info('Init');
  
  ss.db.URL = window.location.protocol + '//' + window.location.hostname;
  
  // Init the ss framework
  ss.Init();

  // initialize the web2.0 (FB/Twitter)
  // AUTH BALL IS HERE
  ss.fb.InitWeb();

  // start loading twitter's widgets after 500ms
  setTimeout(function(){
    var twString = '<script src="http://platform.twitter.com/widgets.js" type="text/javascript"></script>';
    $('body').append(twString);
    // start init cycle for our twitter lib
    ss.twit.Init();
  }, 500);  
  

}; // ss.web.INIT

/**
 * Set DOM Ready main hook
 *
 * @param {Function}
 */
$().ready(ss.web.onDomReady);

/**
 * Will popup a debuging funcy window
 *
 */
ss.web.openFancyWin = function () {
  var debugWindow = new goog.debug.FancyWindow('main');
  debugWindow.setEnabled(true);
  debugWindow.init();
}; // method web.openFancyWin

/**
 * Triggers on server command when we don't have a permanent cookie set
 * Check if we are on a cookie enabled browser and performs a special
 * AJAX request to have the server write us a permanent cookie
 *
 * @return {void}
 */
ss.web.permCook = function()
{
  if (ss.web.cookies.isEnabled()) {
    // cookies enabled, notify server
    var aj = new ss.ajax('/users/pc', {
          postMethod: 'POST'
         , showMsg: false // don't show default success message
         , showErrorMsg: false // don't show error message if it happens
        });
    aj.callback = function(res) {
      // check if we got a new metadataObject ...
      if (goog.isObject(res['metadataRoot'])) {
        ss.metadata.init(res['metadataRoot']);
      }
    };
    // send ajax request
    aj.send();
  }
};

// inline execution, hook on server2js
(function(ss){
  ss.server2js.hook('25', ss.web.permCook);
})(ss);

