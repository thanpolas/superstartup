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
 * createdate 25/Oct/2010
 *
 *********
 *  File:: web2.0/facebook/facebook.main.js
 *  Our main FB bundler file
 *********
 */


/**
 * In this file we have the main facebook event listeners
 * and basic functions.
 *
 * ss Server interaction is in facebook.local.js
 *
 *
 */
goog.provide('ss.fb');
goog.require('ss.fb.local');
goog.require('ss.STATIC');
goog.require('ss.fb.com');
goog.require('goog.Uri');

/**
 * Facebook static needed data object
 *
 * @enum {*}
 */
ss.fb.db = {
  haveInitialAuthStatus: false,
  initialAuthStatus: false,
  /**
     * Needed permitions
     *
     * http://developers.facebook.com/docs/authentication/permissions
     * //permitions: 'publish_stream, email, user_about_me, user_website, user_checkins',
     * @deprecated
     */
  permitions: '',
  /**
     * All known permitions will be stored
     * as keys in this object with a boolean value
     *
     * e.g. {publish_stream: true, email: false} [..]
     */
  hasPerms: {}
}


/**
 * Let's us know if we have checked with Facebook
 * for our authentication status
 *
 * @return {boolean}
 */
ss.fb.haveAuthStatus = function ()
{
  return ss.fb.db.haveInitialAuthStatus;
};

/**
 * Returns the correct Facebook AppId
 * based on which mode we are on (Local server, production)
 *
 * @return {string}
 */
ss.fb.getAppId = function ()
{
  var c = ss;

  return c.conf.fb.app_id;

};



/**
 * Clear the db of values, called by a user logout
 *
 * @return {void}
 */
ss.fb.db.clear = function ()
{
  var db = ss.fb.db;

  db.permitions = '';
  db.hasPerms = [];
  db.initialAuthStatus = false;

}; // function ss.fb.db.clear



/**
 * Will execute when DOM is ready. (called from main.Init)
 *
 * Will initialize the web FB API by inserting
 * script tags in the DOM to load external FB sources
 *
 * @return {void}
 */
ss.fb.InitWeb = function ()
{
  try {
    var s = ss, g = goog;
    var log = s.log('ss.fb.InitWeb');

    log.info('Init');

    s.ready('fb');
    s.ready.addCheck('fb', 'loaded');

    // create fb-auth check
    s.ready('fb-auth');
    s.ready.addCheck('fb-auth', 'done');


    // capture FB API Load event
    g.global['fbAsyncInit'] = function() {
      s.fb.Init();
    };

    // request the facebook api
    var d = g.global['document'];
    var e = d.createElement('script');
    var src = d.location.protocol;
    if (s.DEVEL)
      src += '//static.ak.fbcdn.net/connect/en_US/core.debug.js';
    else
      src += '//connect.facebook.net/en_US/all.js';
    e.src = src;
    e.async = true;
    d.getElementById('fb-root').appendChild(e);

    s.web2.db.initialCheck.timeout = setTimeout(s.web2.authStateTimeout,
      s.web2.db.initialCheck.timeoutTime);


  } catch(e){
    ss.error(e);
  }
}; // ss.fb.InitWeb


/**
 * Fires when facebook API is ready and loaded
 *
 * We initialize the FB API and add event listeners
 * register ourselves
 *
 * @return {void}
 */
ss.fb.Init = function ()
{
  try {

    var fb = FB;
    var c = ss;
    var log = c.log('ss.fb.Init');

    log.info('Init - FB LIB LOADED. Our App ID:' + c.fb.getAppId());
    fb.init({
      'appId'  : c.fb.getAppId(),
      'status' : true, // check login status
      'cookie' : true, // enable cookies to allow the server to access the session
      'xfbml'  : true,  // parse XFBML
      'oauth'  : true
    });

    // catch session change events
    fb.Event.subscribe('auth.sessionChange', c.fb.sessionChange);

    // catch commenting and uncommenting
    fb.Event.subscribe('comment.create', c.fb.com.create);
    fb.Event.subscribe('comment.remove', c.fb.com.remove);

    // catch initial login status
    fb.getLoginStatus(c.fb.getInitialLoginStatus);

    // catch edge events 'like'
    // fired when the user likes something (fb:like)
    fb.Event.subscribe('edge.create', c.fb.edgeCreate);
    // unlike event
    fb.Event.subscribe('edge.remove', c.fb.edgeRemove);

    // finish the ready watch, we are loaded
    c.ready.check('fb', 'loaded');

  } catch(e) {
    ss.error(e);
  }
}; // function ss.fb.Init

/**
 * Initial login status of user
 *
 * @param {object} response
 * @return {void}
 */
ss.fb.getInitialLoginStatus = function (response)
{
  try {
    var c = ss;
    var g = goog;
    var log = c.log('ss.fb.getInitialLoginStatus');

    // store the result
    c.fb.db.haveInitialAuthStatus = true;

    if (c.fb.isAuthedFromResponse(response)) {
      log.info('FACEBOOK We are CONNECTED.');
      c.web2.collectInitialAuthChecks(c.STATIC.SOURCES.FB, true);
      // validate the auth with our server
      c.fb.local.checkFacebookAuth(function(state){

        if (state) {
          c.fb.db.initialAuthStatus = true;
          c.web2.collectInitialAuthChecks(c.STATIC.SOURCES.FB, true, true);
        } else {
          c.fb.db.initialAuthStatus = false;
          c.web2.collectInitialAuthChecks(c.STATIC.SOURCES.FB, true, false);
        }

        // inform that our FB auth check is done
        c.ready.check('fb-auth', 'done');
      });
      return;
    } else {
      log.info('FACEBOOK NOT connected. status:' + response.status);
      c.fb.db.initialAuthStatus = false;
      // notify web2.0 of no login here
      c.web2.collectInitialAuthChecks(c.STATIC.SOURCES.FB, false);

      // inform that our FB auth check is done
      c.ready.check('fb-auth', 'done');

    }

  } catch(e) {
    ss.error(e);
  }
}; // function getInitialLoginStatus


/**
 * Request the permissions we have for the currently logged
 * in user.
 * 
 *
 * @param {Function()} Callback function for the result
 * @return {void}
 */
ss.fb.getPermissions = function (callback)
{
  try {
    
    FB.api('/me/permissions', function (response) {
    } );
  } catch(e) {
    ss.error(e);
  }
};

/**
 * Session Change event
 *
 * @param {object} responce Served from FB SDK
 * @return {void}
 */
ss.fb.sessionChange = function (response)
{
  try {
    var c = ss, g = goog;
    var log = c.log('ss.fb.sessionChange');

    log.info('Init. response.perms:' + response.perms);
    log.info('Init. response.session.expose:' + g.debug.expose(response.session));
    /**
     * response expose:
     *

    session = {
        session_key = 2.nE7AVOAY5BDd9apfn4yAAQ__.3600.1288249200-100001091766371
        uid = 100001091766371
        expires = 1288249200
        secret = ITO3HqGTvylmHuYerITx_g__
        access_token = 119565011437683|2.nE7AVOAY5BDd9apfn4yAAQ__.3600.1288249200-100001091766371|PHzP-T8P8mAq5-eMNUbha6ZjdzY
        sig = 58c78d0312a0419b553be394a73c801f
    }
    // The status of the User. One of connected, notConnected or unknown.
    status = connected
    perms = publish_stream,email,user_about_me,user_website,user_checkins

    */


    if (c.fb.isAuthedFromResponse(response)) {
      // A user has logged in, and a new cookie has been saved
      // check if already logged in
      if (c.isAuthed())
        return;

    // neat, register ourselves with the server

    } else {
  // The user has logged out, and the cookie has been cleared
  }

  } catch(e) {
    ss.error(e);
  }
}; // function sessionChange


/** 
 * When an auth event / action is performed FB returns a response 
 * object. This object changes from times to times so we have
 * to create this function to rule them all
 *
 * We check the response if we have a successfull authentication
 * and respond acordingly 
 *
 * @param {object} response the FB response object
 * @return {boolean} if we are authed or not
 */
ss.fb.isAuthedFromResponse = function(response)
{
  try {
    if('connected' == response.status)
      return true;
    return false;
  } catch(e) {
    ss.error(e);
  }
};

/**
 * Facebook Login Listener.
 * We listen for the completion of the fb login modal
 *
 * @param {object} response
 * @param {Function(boolean)=} opt_callback
 * @return {void}
 */
ss.fb.loginListener = function (response, opt_callback)
{
  try {
    var c = ss;
    var g = goog;
    var log = c.log('ss.fb.loginListener');

    log.info('Init. response.status:' + response.status);

    var callback = opt_callback || function (){};

    if (c.fb.isAuthedFromResponse(response)) {
      c.fb.local.loginSubmit(callback);
    } else
      callback(false);



  //FB.api('/me', function(res){

  //log.info('me expose:' + g.debug.expose(res));
  //})

  } catch(e) {
    ss.error(e);
  }
}; // function ss.fb.loginListener




/**
 * Open the login dialog
 *
 * @param  {function(boolean)=} opt_callback optional callback
 * @param {string=} opt_perms set permitions if we need to...
 *      comma separate them
 * @this {DOM}
 * @return {void}
 */
ss.fb.loginOpen = function (opt_callback, opt_perms)
{
  var c = ss;
  var g = goog;
  var fb = FB;

  var callback = opt_callback || function (){};

  if (g.isString(opt_perms))
    var paramsObj = {
      perms: opt_perms
    };
  else
    var paramsObj = {
      perms: c.conf.fb.permitions
    };

  if (c.WEB) {
    fb.login(function(response){

      c.fb.loginListener(response, callback)
    }, paramsObj);
  }
}; // function ss.fb.loginOpen



/**
 * We will attempt to link the logged in current user
 * with his facebook account
 *
 * @param {Function(boolean)=} opt_callback function
 * @return {void}
 */
ss.fb.linkUser = function(opt_callback)
{
  try {

    var c = ss;
    var g = goog;
    var fb = FB;
    var log = c.log('ss.fb.linkUser');

    var callback = opt_callback || function(){};

    if (!c.isAuthed()) {
      callback(false);
      return;
    }


    // check if user already on facebook
    if (c.user.auth.hasExtSource(c.STATIC.SOURCES.FB)) {
      callback(true);
      return;
    }



    if (c.WEB) {
      fb.login(function(response){
        if (response.session) {
          //console.debug(response);
          c.fb.local.linkUser(callback);
        } else
          callback(false);
      }, {});
    }


  } catch(e) {
    ss.error(e);
  }
}; // function ss.fb.linkUser

/**
 * Fires when we have an edge event like fb:like
 *
 * @param {object} result
 * @param {object} fbobj an uknown object returned by FB
 * @return {void}
 */
ss.fb.edgeCreate = function (result, fbobj)
{
  try {

    var c = ss;
    var g = goog;
    var fb = FB;
    var log = c.log('ss.fb.edgeCreate');



    // we can locate the ref inside the fobj, go carefully...
    var ref = '';
    if (g.isObject(fbobj._attr)) {
      if (g.isString(fbobj._attr.ref)) {
        ref = fbobj._attr.ref;
      }
    }

    log.info('Like Event fired:' + result + ' ref:' + ref);
    //var uri = new g.Uri(result)
    //var uriPath = uri.getPath();

    //strip

    //c.analytics.trackEvent('Share-Frame', 'Facebook-LIKE', ref + '::' + result, 1);
    //c.analytics.trackMetrics('Share', 'facebook-like', result, ref);
    //c.analytics.trackSocial('facebook', 'like', result);


  } catch(e) {
    ss.error(e);
  }
}; // function ss.fb.edgeCreate


/**
 * Fires when we have an edge REMOVE event like fb:unlike
 *
 * @param {object} result targetURL
 * @param {object} fbobj an uknown object returned by FB
 * @return {void}
 */
ss.fb.edgeRemove = function (result, fbobj)
{
  try {

    var c = ss;
    var g = goog;
    var log = c.log('ss.fb.edgeRemove');

    // we can locate the ref inside the fobj, go carefully...
    var ref = '';
    if (g.isObject(fbobj._attr)) {
      if (g.isString(fbobj._attr.ref)) {
        ref = fbobj._attr.ref;
      }
    }

    log.info('UNLike Event fired:' + result + ' ref:' + ref);
    //var uri = new g.Uri(result)
    //var uriPath = uri.getPath();

    //strip

    //c.analytics.trackEvent('Share-Frame', 'Facebook-UNLIKE', ref + '::' + result, -1);
    //c.analytics.trackMetrics('Share', 'facebook-unlike', result, ref);
    //c.analytics.trackSocial('facebook', 'unlike', result);


  } catch(e) {
    ss.error(e);
  }
}; // function ss.fb.edgeRemove


/**
 *
 * Dummy Code for debug console
 *
 *
FB.login(function(ret){
    console.debug(ret);
}, {'perms': 'publish_stream, email, user_about_me, user_website, user_checkins'});

    FB.api('/me', function(res){
        console.debug(res)
    })


jQuery("#mc_header").html('<fb:login-button></fb:login-button>')

*/

/**
 * Get a proper XFBML like button
 *
 * Mostly for web ?
 *
 * For documentation go to:
 * https://developers.facebook.com/docs/reference/plugins/like/
 *
 * @param {string} url
 * @param {Number=} opt_width default is 400
 * @param {Object=} opt_params Any number of parameter/value keys as 
 *      described in FB Docs
 * @param {Number=} opt_width width for like button
 * @return {string}
 */
ss.fb.getLikeButton = function (url, opt_params, opt_width)
{
  var g = goog;

  var params = opt_params || null;
  var width = opt_width || 60;
  var likeUrl = '<fb:like href="' + url + '" ';
  if (!g.isNull(params)) {
    g.object.forEach(params, function (value, key){
      likeUrl += key + '="' + value + '" ';
    });
  }


  return likeUrl + '></fb:like>';
  return '<fb:like href="' + url + '" width="' + width + '"></fb:like>';





}; // function ss.fb.getLikeButton

/**
 * Checks if user has defined permitions
 *
 * For a list of permitions check:
 * http://developers.facebook.com/docs/authentication/permissions
 *
 * @param {string} value
 * @param {Function(boolean)} callback responce is provided through a callback
 * @return {void}
 */
ss.fb.hasPerm = function (value, callback)
{
  try {
    var c = ss;
    var g = goog;
    var db = c.fb.db;
    var log = c.log('ss.fb.hasPerm');

    log.info('Init for:' + value);

    // check if on mobile
    if (c.MOBILE) {
        // TBD
      return;
    }

    // check if we have this perm cached localy
    if (g.isBoolean(db.hasPerms[value])) {
      callback(db.hasPerms[value]);
      return;
    }

    // request permition check by facebook
    FB.api({
      method:'users.hasAppPermission',
      ext_perm: value
    },
    function(response){
      log.info('Got response:' + response);
      // we expect 1 or 0 or error... check for '1'
      if ('1' === response) {
        // user has permition, store it
        db.hasPerms[value] = true;
        callback(true);
      } else {
        // not
        db.hasPerms[value] = false;
        callback(false);
      }
    }
    );


  } catch(e) {
    ss.error(e);
  }
}; // ss.fb.hasPerm
