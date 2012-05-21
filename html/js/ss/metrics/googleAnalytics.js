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
 * createdate 19/Nov/2010
 *
 *********
 *  File:: metrics/googleAnalytics.js 
 * Wrapper for analytics
 *********
 */

goog.provide('ss.metrics.ga');

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
ss.metrics.ga.trackEvent = function (category, action, opt_label, opt_value)
{
    // send the event to GA
    window['_gaq'].push(['_trackEvent', category, action, opt_label, opt_value]);
};











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
ss.metrics.ga.trackPageview = function (opt_pageURL)
{
    // send the request
    window['_gaq'].push(['_trackPageview', opt_pageURL]);
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
ss.metrics.ga.trackSocial = function (network, socialAction, opt_target, opt_pagePath)
{
  try {
    var w = window;

    if (!w.ss.WEBTRACK)
        return;

    w._gaq.push(['_trackSocial', network, socialAction, opt_target, opt_pagePath]);

  } catch (e) {
    ss.error(e);
  }

};

/**
 * Track Custom Vars in google analytics
 * 
 * @see https://developers.google.com/analytics/devguides/collection/gajs/gaTrackingCustomVariables
 * @param {Number} slot The custom var slot.
 * @param {string} name The name acts as a kind of category for the user activity.
 * @param {string} value The value of the CV
 * @param {Number=} The scope of the CV (1 (visitor-level), 2 (session-level), 
 *      or 3 (page-level))
 * @return {void}
 */
ss.metrics.ga.customVar = function(slot, name, value, opt_scope) 
{
    window['_gaq'].push(['_setCustomVar', slot, name, value, opt_scope]);
};
