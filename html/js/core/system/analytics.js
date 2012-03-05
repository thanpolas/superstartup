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
 * @createdate 19/Nov/2010
 *
 *********
 *  File:: system/analytics.js 
 * Wrapper for analytics
 *********
 */



goog.provide('core.analytics');

/**
 * Constructs and sends the event tracking call to the Google
 * Analytics Tracking Code. Use this to track visitor behavior
 * on your website that is not related to a web page visit,
 * such as interaction with a Flash video movie control or
 * any user event that does not trigger a page request.
 *
 * http://code.google.com/apis/analytics/docs/gaJS/gaJSApiEventTracking.html#_gat.GA_EventTracker_._trackEvent
 *
 *
 * @param {string} category The name you supply for the group of
 *      objects you want to track.
 * @param {string} action A string that is uniquely paired with
 *      each category, and commonly used to define the type of user interaction for the web object.
 * @param {string=} opt_label An optional string to provide additional dimensions to the event data.
 * @param {Number=} opt_value An integer that you can use to provide numerical data about the user event.
 * @return {void}
 */
core.analytics.trackEvent = function (category, action, opt_label, opt_value)
{
    try {
    var w = window, c = core;

    if (!core.WEBTRACK)
        return;

    // send the event to GA
    w._gaq.push(['_trackEvent', category, action, opt_label, opt_value]);

    // send the event to Mixpanel
    var props = {
      'action': action,
      'label' : opt_label || '',
      'value' : opt_value || ''

    };

    c.analytics.trackMP(category, props);



    } catch (e) {core.error(e);}
}; // core.analytics.trackEvent


/**
 * Server metrics counter - Use it to store metrics to server
 *
 * @param {string} category The name you supply for the group of
 *      objects you want to track.
 * @param {string} action A string that is uniquely paired with
 *      each category, and commonly used to define the type of user interaction for the web object.
 * @param {string=} opt_label An optional string to provide additional dimensions to the event data.
 * @param {string=} opt_value A string that you can use to provide numerical data about the user event.
 * @param {string=} opt_value2 Additional data to store
 * @param {string=} opt_value3 Additional data to store
 * @param {string=} opt_value4 Additional data to store
 * @return {void}
 */
core.analytics.trackMetrics = function (category, action, opt_label, opt_value,
    opt_value2, opt_value3, opt_value4)
{
  try {
    var c = core;


    var aj = new c.ajax('/mtr/track', {
      postMethod: 'POST'
     , showMsg: false // don't show default success message
     , showErrorMsg: false // don't show error message if it happens
    });

    aj.addData('category', category);
    aj.addData('mtraction', action);
    aj.addData('label', opt_label || '');
    aj.addData('value', opt_value || '');
    aj.addData('value2', opt_value2 || '');
    aj.addData('value3', opt_value3 || '');
    aj.addData('value4', opt_value4 || '');


    // send ajax request
    aj.send();


  } catch (e) {
    core.error(e);
  }

}; // core.analytics.trackMetrics









/**
 * Main logic for GATC (Google Analytic Tracker Code).
 * If linker functionalities are enabled, it attempts to extract
 * cookie values from the URL. Otherwise, it tries to extract cookie
 * values from document.cookie. It also updates or creates cookies
 * as necessary, then writes them back to the document object.
 * Gathers all the appropriate metrics to send to the UCFE
 * (Urchin Collector Front-end).
 *
 * http://code.google.com/apis/analytics/docs/gaJS/gaJSApiBasicConfiguration.html#_gat.GA_Tracker_._trackPageview
 *
 *
 * @param {string=} opt_pageURL Values from s.ui.History.tokens.spot.sdv
 *      Optional parameter to indicate what page URL to
 *      track metrics under.
 *      When using this option, use a beginning slash (/)
 *      to indicate the page URL.
 * @return {void}
 */
core.analytics.trackPageview = function (opt_pageURL)
{
    try {
    var w = window;

    if (!core.WEBTRACK)
        return;

    // check if we have a string value, append hash tag '/#'
    //if (g.isString(opt_pageURL))
      //  opt_pageURL = '/#' + opt_pageURL;

    // send the request
    w._gaq.push(['_trackPageview', opt_pageURL]);

    // send the pageview to Mixpanel
    var props = {
      'page': opt_pageURL,
      'mp_note': opt_pageURL
    };
    w.mpq.track('pageview', props);


    } catch (e) {core.error(e);}
}; // core.analytics.trackPageview


/**
 * Trigger whenever we have an authentication event
 *
 * @param {object} user user standard object
 * @return {void}
 */
core.analytics.userAuth = function (user)
{
  try {
    var w = window;
    if (!core.WEBTRACK)
        return;

    // Google CUSTOM VAR SLOT 1
    // this is also set in the header.php view
     w._gaq.push(['_setCustomVar',
      1,                   // This custom var is set to slot #1.  Required parameter.
      'userAuthed',     // The name acts as a kind of category for the user activity.  Required parameter.
      'true',               // This value of the custom variable.  Required parameter.
      2                    // Sets the scope to session-level.  Optional parameter.
   ]);

   // mixpanel name tag
   w.mpq.name_tag(user.userId + '::' + user.nickname);


  } catch (e) {
    core.error(e);
  }

};

/**
 * Implements mixpanel's identify function for uniquely identifying
 * visitors.
 *
 * For now we track our visitors using the permanent Cook ID
 * Called from: core.metadata.newObject();
 *
 *
 * @param {Number} permId
 * @return {void}
 */
core.analytics.identify = function (permId)
{
  try {

    if (!core.WEBTRACK)
        return;
    window.mpq.identify(permId);


  } catch (e) {
    core.error(e);
  }

};


/**
 * MixPanel implementation of event tracking
 *
 * @param {string} name
 * @param {object=} props custom properties
 * @return {void}
 */
core.analytics.trackMP = function (name, props)
{
  try {
    var w = window;

    if (!core.WEBTRACK)
        return;

    props = props || {};
    
    // patch for MP not showing the properties on the stream
    // views, we will use mp_note
    var mp_note = '';
    goog.object.forEach(props, function(val, index) {
      mp_note += index + ':' + val + ' / ';
    });
    props.mp_note = mp_note;
    //console.debug(properties);
    w.mpq.track(name, props || {});

  } catch (e) {
    core.error(e);
  }

};

/**
 * Track a social event (Sharing)
 *
 * @link http://code.google.com/apis/analytics/docs/tracking/gaTrackingSocial.html
 * @param {string} network Required. A string representing the social
 *        network being tracked (e.g. Facebook, Twitter, LinkedIn)
 * @param {string} socialAction Required. A string representing the social
 *        action being tracked (e.g. Like, Share, Tweet)
 * @param {string=} opt_target Optional. A string representing the URL
 *        (or resource) which receives the action. For example, if a
 *        user clicks the Like button on a page on a site, the the
 *        opt_target might be set to the title of the page, or an ID used to
 *        identify the page in a content management system. In many cases,
 *        the page you Like is the same page you are on. So if this
 *        parameter is undefined, or omitted, the tracking code defaults to
 *        using document.location.href.
 * @param {string=} opt_pagePath Optional. A string representing the page
 * by path (including parameters) from which the action occurred.
 * For example, if you click a Like button on
 * http://code.google.com/apis/analytics/docs/index.html, then
 * opt_pagePath should be set to /apis/analytics/docs/index.html.
 * Almost always, the path of the page is the source of the social action.
 * So if this parameter is undefined or omitted, the tracking code defaults
 * to using location.pathname plus location.search. You generally only need
 * to set this if you are tracking virtual pageviews by modifying the
 * optional page path parameter with the Google Analytics
 * _trackPageview method.
 *
 */
core.analytics.trackSocial = function (network, socialAction, opt_target, opt_pagePath)
{
  try {
    var w = window;

    if (!core.WEBTRACK)
        return;

    w._gaq.push(['_trackSocial', network, socialAction, opt_target, opt_pagePath]);

  } catch (e) {
    core.error(e);
  }

};