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
 * Parses the JS injections in the html file as page is loaded
 * createdate 24/May/2011
 *
 */

goog.provide('ss.web.system.tagLander');


goog.require('ss.error');
goog.require('ss.user');
goog.require('ss.user.auth');
goog.require('ss.STATIC');

/**
 * The master array where we will store the incoming data from
 * the server
 * @type {array}
 */
ss.web.system.injArr = [];

/**
 * Called within a script tag in html, invoked by the server
 * for passing extra objects in the js engine
 *
 * @param {array} arr the object we want to inject
 * @return {void}
 */
ss.web.system.tagLander = function(arr)
{
  ss.web.system.injArr = arr;
}; // method ss.web.system.tagLander

/**
 * Fired when DOM is ready, this method parses injected
 * data objects from server. Check out ss.web.system.tagLander
 *
 * Current tags:
 *
 * 5   :: Core invironment (devel / prod)
 * 55  :: Campaign visitor (FB)
 * 56  :: Perm Cook data object (metadata)
 * 121 :: New User
 * 102 :: User is authed
 * 20  :: Visitor is on mobile
 * 25  :: We see visitor for first time. Check if cookies enabled
 *        and notify server to store perm cookie
 *
 *
 * @return void
 */
ss.web.system.tagLanderParse = function()
{
    var win = window, j = $, s = ss, w = s.web, g = goog;
    //go through the array and check for values
    var arr = w.system.injArr;
    var log = s.log('ss.web.system.tagLanderParse');
    
    log.info('Init');

    var obj = null;

    // check Core Env
    obj = s.arFind(arr, 'action', 5);
    if (!g.isNull(obj)) {
      var ob = obj['obj'];
      // we found ss states assign to web
      if (g.isBoolean(ob['DEVEL']))
        s.DEBUG = ob['DEVEL'];
      if (g.isBoolean(ob['PRODUCTION']))
        s.ONSERVER = ob['PRODUCTION'];
      if (g.isBoolean(ob['PREPROD']))
        s.PREPROD = ob['PREPROD'];

      // now inform google
      g.DEBUG = s.DEBUG;
      // open debug win if in debug
      if (s.DEBUG || s.PREPROD)
        w.openFancyWin();
      else
      // check if we have the magic 'debugwindow' var in the url params
      //var uri = g.Uri(window.location.href);
      //if (g.isString(uri.getParameterValue('debugwindow')))
      //    s.debug.openFancyWin();

      // check if we are on server and enable tracking if
      // it is there
      if (s.ONSERVER)
        s.WEBTRACK = true; // enable tracking

      log.info('Core Environment Set. DEBUG:' + s.DEBUG + ' ONSERVER:' + s.ONSERVER + ' PREPROD:' + s.PREPROD);

    }

    // now if the user is logged in
    obj = s.arFind(arr, 'action', 102);
    if (!g.isNull(obj)) {
      log.info('Got action 102 - user is logged in');
      if (!g.isObject(obj['obj'])) {
        log.warning('obj.obj is not an object. obj:' + g.debug.expose(obj));
        return;
      }
      // user is logged in...    
      s.user.auth.login(obj['obj'], function(state, opt_msg){}, s.STATIC.SOURCES.WEB);
    }



    /**
     * The rest of the method's payload will get
     * executed when we are ready
     *
     * @private
     * @return void
     */
    function _parse() {
      try {
      log.info('_parse STARTS TO EXECUTE');

      var l = arr.length;
      if (!l) return; //if empty exit
      while(l--) {
        obj = arr[l];
        if (!g.isNumber(obj['action'])) continue; //invalid

        switch(obj['action']) {
          // visitor from campaign
          case 55:
            var cdata = obj['obj'];
            log.info('ACTION 55 :: Visitor from campaign. Source' + cdata['source'] + ' Campaign:' + cdata['campaign'] + ' version:' + cdata['version']);
            s.analytics.trackPageview('/campaigns/fb');
            s.analytics.trackEvent('Campaigns', cdata['source'], cdata['campaign'], cdata['version'], 1);

          break;
          // new user
          case 121:
            log.info('ACTION 121 :: New user');
            // trigger new user event
            s.user.auth.events.runEvent('newUser');

          break;

          // visitor is on mobile
          case 20:
            log.info('ACTION 20 :: Mobile visitor');
            // mobile type is on:
            // obj['obj']['mobile']
            s.MOB = true;
            s.ui.mobile.Init();

          break;

          case 25:
            log.info('ACTION 25 :: Check write cookies for permcook');
            if (w.cookies.isEnabled()) {
              // cookies enabled, notify server
              log.info('Cookies enabled, notifying server');
              var aj = new s.ajax('/users/pc', {
                    postMethod: 'POST'
                   , showMsg: false // don't show default success message
                   , showErrorMsg: false // don't show error message if it happens
                  });
              aj.callback = function(res) {
                // check if we got a new metadataObject ...
                if (g.isObject(res['metadataObject'])) {
                  s.analytics.trackMP('newVisitor');
                  s.metadata.newObject(res['metadataObject']);
                }
              }
              // send ajax request
              aj.send();

            }
          break;
 

          /**
           * 56 :: permcook data
           * Keys:
           * permId: Number
           * lastSeenDate: timestamp
           * visitCounter: Number
           * metadata: string (json encoded metadata)
           */
          case 56:
            log.info('ACTION 56 :: Perm Cook metadata');
            s.metadata.newObject(obj['obj']);
          break;
        }
      }
      
      // trigger ready watch for rest of fucntionality
      s.ready.check('ready', 'alldone');
      } catch (e) {
        ss.error(e);
      }
    }




    // check if we are ready (we are not) and attach
    // ourselves to the main ready watch
    if (!s.READY) {
      s.ready.addFunc('main', _parse);
    } else {
      _parse();
    }

}; // method ss.web.system.tagLanderParse
