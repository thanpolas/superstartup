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
 *  File:: web2.0/twitter/twitter.main.js
 */
 
 /**
 * @fileoverview twitter library (auth/share/etc) 
 */


goog.provide('ss.twit');


/**
 * Our static db
 *
 */
ss.twit.db = {
    loginUrl: '/users/twitter',
    loginLinkAccountParams: '?link=1', // use when user wants to link account not login
    twttrPoll: null,
    target: null
};

/**
 * We are triggered inline, so
 * Twitter (window.twttr) has not loaded yet
 * so we will loop until we find it...
 *
 * @return {void}
 */
ss.twit.Init = function ()
{
  ss.twit.db.twttrPoll = setInterval(ss.twit._checkTwttrLoad, 300);
}; // function ss.twit.Init

/**
 * This is the polling function that checks if twttr lib
 * is loaded. If it's loaded then it breaks the interval
 * and executes c.twit.libLoaded();
 *
 * @return {void}
 */
ss.twit._checkTwttrLoad = function()
{
  try {

    if (goog.isDef(window.twttr)){
      clearInterval(ss.twit.db.twttrPoll);
      ss.twit.libLoaded();
    }
  } catch (e) {
    ss.error(e);
  }

};

/**
 * Executes when the twitter widget library is loaded
 *
 * We do proper binds
 *
 * @return {void}
 */
ss.twit.libLoaded = function()
{
  try {
   var log = goog.debug.Logger.getLogger('ss.twit.libLoaded');

   log.info('TWITTER LOADED');
   twttr.events.bind('tweet', ss.twit.eventTweet);

  } catch (e) {
    ss.error(e);
  }

};

/**
 * Triggers when user has tweeted from our modal...
 *
 * event data object contains:
 * data : null
 * region : "intent"
 * target : a.item_share_tw tweet?te...58114481
 * type : "tweet"
 *
 *
 * @param {Object} event
 * @return {void}
 */
ss.twit.eventTweet = function (event)
{
  try {
    var twShare = $(event.target).data('twShare');


    /**
     * the twShare data is an object with these two keys:
     * source: Can be one of:
     *    frame_hover
     *    frame_modal
     *    booth_invite
     *    sfv_main
     * item_id: The id that applies on each different item...
     */

    // succesfully shared on Twitter
    //c.analytics.trackSocial('twitter', 'tweet', twShare.shareUrl);


    switch(twShare.source) {
      case 'frame_hover':
        //c.analytics.trackEvent('Share-Frame', 'Twitter-hover-shared', '', 1);
        //c.analytics.trackMetrics('Share-frame', 'twitter-hover', twShare.item_id, 1);

      break;
      case 'frame_modal':
        //c.analytics.trackEvent('Share-Frame', 'Twitter-modal-shared', '', 1);
        //c.analytics.trackMetrics('Share-frame', 'modal-twitter', twShare.item_id, 1);
      break;
      case 'sfv_main':
        //c.analytics.trackEvent('Share-Frame', 'Twitter-sfv-shared', '', 1);
        //c.analytics.trackMetrics('Share-frame', 'sfv-twitter', twShare.item_id, 1);
      break;
      case 'booth_invite':
        //c.analytics.trackEvent('Invite', 'Twitter-shared', '', 1);
        //c.analytics.trackMetrics('Invite', 'twitter', 'shared', twShare.item_id);
      break;
    }


  } catch (e) {
    ss.error(e);
  }

};

/**
 * When a user Tweets, the callback function receives an
 * object which can usually be used to get the URL of the
 * resource being tweeted. Once the Twitter JavaScript code loads,
 * it transforms the annotated tweet link into an iFrame and the URL
 * being tweeted gets encoded and appended as a query parameter to the
 * URL of the iFrame. The event object passed to our callback has a reference
 * to this iFrame and we can use that to get the URL of the resource
 * being tweeted.
 *
 * The callback function above makes sure the iFrame reference is indeed
 * an iFrame and then tries to extract the resource being tweeted by
 * looking at the url query parameter.
 *
 * Here's an example function to extract a query parameter from a URI:
 *
 * @see http://code.google.com/apis/analytics/docs/tracking/gaTrackingSocial.html
 * @param {string} uri
 * @param {string} paramName
 * @return {string|void}
 */
ss.twit.extractParamFromUri = function(uri, paramName) {
  if (!uri) {
    return;
  }
  var uri = uri.split('#')[0];  // Remove anchor.
  var parts = uri.split('?');  // Check for query params.
  if (parts.length == 1) {
    return;
  }
  var query = decodeURI(parts[1]);

  // Find url param.
  paramName += '=';
  var params = query.split('&');
  for (var i = 0, param; param = params[i]; ++i) {
    if (param.indexOf(paramName) === 0) {
      return unescape(param.split('=')[1]);
    }
  }
};


/**
 * Will compile and return a proper url link to
 * share content to twitter
 *
 *
 * Info from: http://dev.twitter.com/pages/tweet_button
 *
 * Params can include (via twitter doc)
    url :: URL of the page to share
    via :: Screen name of the user to attribute the Tweet to
    text :: Default Tweet text
    related :: Related accounts
    count :: Count box position (none, horizontal, vertical)
    lang :: The language for the Tweet Button
    counturl :: The URL to which your shared URL resolves to
 *
 *
 * @param {string} text What we want to say
 * @param {string} uri The URI part of our link without a leading slash (/)
 * @param {object=} opt_params Parameters as per documentation
 * @return {string}
 */
ss.twit.getHref = function (text, uri, opt_params)
{
  try {
    var params = opt_params || {};

    var href = 'https://twitter.com/intent/tweet?text=';
    href += ss.encURI(text);
    href += '&url=' + ss.encURI(uri);

    if (goog.isString(params.via))
      href += '&via=' + ss.encURI(params.via);

    if (goog.isString(params.related))
      href += '&related=' + ss.encURI(params.related);
    else
      href += '&related=' + ss.encURI('boothchat');

    if (ss.isString(params.count))
      href += '&count=' + ss.encURI(params.count);
    if (goog.isString(params.lang))
      href += '&lang=' + ss.encURI(params.lang);
    if (goog.isString(params.counturl))
      href += '&counturl=' + ss.encURI(params.counturl);

    href += '&_=' + new Date().getTime();

    return href;
  } catch(e){ss.error(e);}
};

/**
 * We will attempt to link the logged in current user
 * with his twitter account
 *
 * @return {void}
 */
ss.twit.linkUser = function()
{
    try {
    var log = goog.debug.Logger.getLogger('ss.twit.linkUser');

    if (!ss.isAuthed())
        return;

    // check if user already on facebook
    if (ss.user.auth.hasExtSource(ss.STATIC.SOURCES.TWIT))
        return;

      // we have to redirect user to /signup/twitter.php
      // to start the authentication process
      // we will add the var link=1 to indicate that
      // we want to link user, not log in...

      // first we will capture the current url of the user
      var url = window.location.hash;

      // assign it as a url var for GET
      url = '&url=' + ss.encURI(url);


      window.location.href =  ss.twit.db.loginUrl + ss.twit.db.loginLinkAccountParams + url;
      
    } catch(e) {ss.error(e);}
}; // function ss.twit.linkUser


/**
 * Open the login dialog
 *
 * NOTE this is very WEB stuff, amend when using for
 * mobile
 *
 * @this {DOM}
 * @return {void}
 */
ss.twit.loginOpen = function ()
{
    try {
    var log = goog.debug.Logger.getLogger('ss.twit.loginOpen');
    // we have to redirect user to /signup/twitter.php
    // to start the authentication process

    // use the current path of the user for return
    var returnPath = '?url=' + ss.encURI(win.location.pathname);
    log.info('Redirecting user to:' + returnPath);
    // redirect the browser now
    window.location.href = ss.twit.db.loginUrl + returnPath;

    } catch(e) {ss.error(e);}
}; // function ss.twit.loginOpen


/**
 * Will open a new window on the browser prompting the user
 * to share content on twitter
 *
 * @param {string} url the target url properly formed by ss.twit.getHref()
 * @return {void}
 */
ss.twit.openShareWindow = function (url)
{
  try {
    var width  = 575,
    height = 400,
    left   = ($(window).width()  - width)  / 2,
    top    = ($(window).height() - height) / 2,
    opts   = 'status=1' +
    ',width='  + width  +
    ',height=' + height +
    ',top='    + top    +
    ',left='   + left;

    window.open(url, 'twitter', opts);
  } catch (e) {
    ss.error(e);
  }

};



