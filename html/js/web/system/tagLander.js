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
 * Parses the JS injections in the html file as page is loaded
 * @createdate 24/May/2011
 *
 */

goog.provide('web.system.tagLander');


goog.require('core.error');

/**
 * Called within a script tag in html, invoked by the server
 * for passing extra objects in the js engine
 *
 * @param {array} arr the object we want to inject
 * @return {void}
 */
web.system.tagLander = function(arr)
{

  var log = goog.debug.Logger.getLogger('web.system.tagLander');

  log.info('Init');

  web.system.injArr = arr;
}; // method web.system.tagLander

/**
 * Fired when DOM is ready, this method parses injected
 * data objects from server. Check out web.system.tagLander
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
web.system.tagLanderParse = function()
{
  try {


    var w = web;
    var c = core;
    var g = goog;
    //go through the array and check for values
    var arr = w.system.injArr;
    var log = g.debug.Logger.getLogger('web.system.tagLanderParse');

    log.info('Init');

    var obj = null;

    // check Core Env
    obj = c.arFind(arr, 'action', 5);
    if (!g.isNull(obj)) {
      // we found core states assign to web
      if (g.isBoolean(obj.obj['DEVEL']))
        c.DEBUG = obj.obj['DEVEL'];
      if (g.isBoolean(obj.obj['PRODUCTION']))
        c.ONSERVER = obj.obj['PRODUCTION'];
      if (g.isBoolean(obj.obj['PREPROD']))
        c.PREPROD = obj.obj['PREPROD'];

      // now inform google
      g.DEBUG = c.DEBUG;
      // open debug win if in debug
      if (c.DEBUG || c.PREPROD)
        w.openFancyWin();
      else
      // check if we have the magic 'debugwindow' var in the url params
      //var uri = g.Uri(window.location.href);
      //if (g.isString(uri.getParameterValue('debugwindow')))
      //    s.debug.openFancyWin();

      // check if we are on server and enable tracking if
      // it is there
      if (c.ONSERVER)
        c.WEBTRACK = true; // enable tracking



      log.info('Core Environment Set. DEBUG:' + c.DEBUG + ' ONSERVER:' + c.ONSERVER + ' PREPROD:' + c.PREPROD);

    }

    // now if the user is logged in
    obj = c.arFind(arr, 'action', 102);
    if (!g.isNull(obj)) {
      log.info('Got action 102 - user is logged in');
      if (!g.isObject(obj.obj)) {
        log.warning('obj.obj is not an object. obj:' + g.debug.expose(obj));
        return;
      }
      // user is logged in...
      c.user.auth.Init(obj.obj, function(state, opt_msg) {

      }, c.STATIC.SOURCES.WEB);

      // add login check
      //c.ready.addCheck('main', 'login');
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
        if (!g.isNumber(obj.action)) continue; //invalid

        switch(obj.action) {
          // visitor from campaign
          case 55:
            var cdata = obj['obj'];
            log.info('ACTION 55 :: Visitor from campaign. Source' + cdata['source'] + ' Campaign:' + cdata['campaign'] + ' version:' + cdata['version']);
            c.analytics.trackPageview('/campaigns/fb');
            c.analytics.trackEvent('Campaigns', cdata['source'], cdata['campaign'], cdata['version'], 1);

          break;
          // new user
          case 121:
            log.info('ACTION 121 :: New user');

            // call new user function
            w.user.ui.newUser();

            // do a pageview after 2"
            setTimeout(function(){
              c.analytics.trackPageview('/mtr/users/new');
            }, 2000);
            // track on MixPanel
            c.analytics.trackMP('newUser', {source:'TW'});


          break;

          // visitor is on mobile
          case 20:
            log.info('ACTION 20 :: Mobile visitor');
            // mobile type is on:
            // obj['obj']['mobile']
            w.MOB = true;
            w.ui.mobile.Init();

          break;

          case 25:
            log.info('ACTION 25 :: Check write cookies for permcook');
            if (w.cookies.isEnabled()) {
              // cookies enabled, notify server
              log.info('Cookies enabled, notifying server');
              var aj = new c.ajax('/users/pc', {
                    postMethod: 'POST'
                   , showMsg: false // don't show default success message
                   , showErrorMsg: false // don't show error message if it happens
                  });
              aj.callback = function(res) {
                // check if we got a new metadataObject ...
                if (g.isObject(res['metadataObject'])) {
                  c.analytics.trackMP('newVisitor');
                  c.metadata.newObject(res['metadataObject']);
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
            c.metadata.newObject(obj['obj']);
          break;
        }
      }
      
      // trigger ready watch for rest of fucntionality
      c.ready.check('ready', 'alldone');
      } catch (e) {
        core.error(e);
      }
    }




    // check if we are ready (we are not) and attach
    // ourselves to the main ready watch
    if (!c.READY) {
      c.ready.addFunc('main', _parse);
    } else {
      _parse();
    }
    
    
    


    return;





  } catch (e) {
    core.error(e);
  }
}; // method web.system.tagLanderParse
