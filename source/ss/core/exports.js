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
 * createdate 19/May/2012
 */

/**
 * @fileoverview Declare all the symbols we want to export
 */

goog.provide('ss.exports');
goog.require('ss.metrics');
goog.require('ss.server2js');
goog.require('ss.Core');
goog.require('ss.user.Auth');
goog.require('ss.user.auth.Facebook');
goog.require('ss.user.auth.Twitter');

// core
goog.exportSymbol('ss', ss.Core.getInstance);
goog.exportSymbol('ss.init', ss.Core.prototype.init);

// user
goog.exportSymbol('ss.user', ss.user.Auth);
goog.exportSymbol('ss.user.isAuthed', ss.user.Auth.isAuthed);
goog.exportSymbol('ss.user.isExtAuthed', ss.user.Auth.isExtAuthed);
goog.exportSymbol('ss.user.isVerified', ss.user.Auth.isVerified);
goog.exportSymbol('ss.user.logout', ss.user.Auth.logout);

// external auth
goog.exportSymbol('ss.user.facebook.login', ss.user.auth.Facebook.prototype.login);
goog.exportSymbol('ss.user.facebook.logout', ss.user.auth.Facebook.prototype.logout);

goog.exportSymbol('ss.user.twitter.logout', ss.user.auth.Twitter.prototype.logout);
goog.exportSymbol('ss.user.twitter.logout', ss.user.auth.Twitter.prototype.logout);

// modules
goog.exportSymbol('ss.metrics.trackEvent', ss.metrics.trackEvent);
goog.exportSymbol('ss.metrics.trackMetrics', ss.metrics.trackMetrics);
goog.exportSymbol('ss.metrics.trackPageview', ss.metrics.trackPageview);


if (!COMPILED) {
  goog.exportSymbol('s', ss.Core.getInstance);
}