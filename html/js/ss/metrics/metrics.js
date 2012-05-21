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
 *  File:: metrics/metrics.js 
 * Metrics main file
 *********
 */

goog.provide('ss.metrics');

goog.require('ss.metrics.ga');
goog.require('ss.metrics.mixpanel');

/**
 * Our local data object
 * @type {Object}
 */
ss.metrics.db = {
  init: false,
  GA_enable: false,
  GA_property_id: '',
  GA_enable_CV_auth: false,
  GA_enable_CV_auth_params: {},
  MP_enable: false
};
/**
 * Initialize metrics with parameters as passed
 * from the server
 * 
 * @param {object} params
 * @return {void}
 */
ss.metrics.init = function(params)
{
  try {
    var s = ss, db = s.metrics.db;
    db.init = true;
    db.GA_enable = params['GA_enable'];
    db.GA_property_id = params['GA_property_id'];
    db.GA_enable_CV_auth = params['GA_enable_CV_auth'];
    db.GA_enable_CV_auth_params = params['GA_enable_CV_auth_params'];
    db.MP_enable = params['MP_enable'];
    // check if we are on server and enable tracking if
    // it is there
    if (s.ONSERVER)
      s.WEBTRACK = db.GA_enable || db.MP_enable; // enable tracking if any
    
  } catch(e) {
    ss.metrics.init = false;
    ss.error(e);
  }
};

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
ss.metrics.trackEvent = function (category, action, opt_label, opt_value)
{
    var s = ss;

    if (!s.WEBTRACK)
        return;

    // send the event to GA
    s.metrics.ga.trackEvent(category, action, opt_label, opt_value);

    // prepare and send the event to Mixpanel
    var props = {
      'action': action,
      'label' : opt_label || '',
      'value' : opt_value || ''
    };

    s.metrics.mixpanel.track(category, props);
};




/**
 * Server metrics track - Use it to store metrics to server
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
ss.metrics.trackMetrics = function (category, action, opt_label, opt_value,
    opt_value2, opt_value3, opt_value4)
{
    var aj = new ss.ajax('/mtr/track', {
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
};


/**
 * Register a Page View with our analytics
 *
 * Main logic for GATC (Google Analytic Tracker Code).
 * If linker functionalities are enabled, it attempts to extract
 * cookie values from the URL. Otherwise, it tries to extract cookie
 * values from document.cookie. It also updates or creates cookies
 * as necessary, then writes them back to the document object.
 * Gathers all the appropriate metrics to send to the UCFE
 * (Urchin Collector Front-end).
 *
 * @see http://code.google.com/apis/analytics/docs/gaJS/gaJSApiBasicConfiguration.html#_gat.GA_Tracker_._trackPageview
 * @param {string=} opt_pageURL Values from s.ui.History.tokens.spot.sdv
 *      Optional parameter to indicate what page URL to
 *      track metrics under.
 *      When using this option, use a beginning slash (/)
 *      to indicate the page URL.
 * @return {void}
 */
ss.metrics.trackPageview = function (opt_pageURL)
{
    var s = ss;
    if (!s.WEBTRACK)
        return;
    s.metrics.ga.trackPageview(opt_pageURL);
    // prepare and send the pageview to Mixpanel
    var props = {
      'page': opt_pageURL,
      'mp_note': opt_pageURL
    };
    s.metrics.mixpanel.track('pageview', props);
}; 

/**
 * Trigger whenever we have an authentication event
 *
 * @param {object} user user standard object
 * @return {void}
 */
ss.metrics.userAuth = function (user)
{
    var s = ss;
    if (!s.WEBTRACK)
        return;
    // check if we want to track auth custom vars
    if (s.db.GA_enable_CV_auth) {
      var cv = s.db.GA_enable_CV_auth_params;
      s.metrics.ga.customVar(cv['slot'], cv['var_name'], cv['var_value'], cv['scope_level']);
    }

   // mixpanel name tag
   if (s.db.MP_enable)
      s.metrics.mixpanel.nameTag(user.userId + '::' + user.nickname);

};


