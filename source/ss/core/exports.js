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

goog.provide('ssd.exports');
goog.require('ssd.metrics');
goog.require('ssd.server2js');
goog.require('ssd.Core');
goog.require('ssd.user.Auth');
goog.require('ssd.user.auth.Facebook');
goog.require('ssd.user.auth.Twitter');

// core
goog.exportSymbol('ssd', ssd.Core.getInstance);
goog.exportSymbol('ssd.init', ssd.Core.prototype.init);

// user
goog.exportSymbol('ssd.user', ssd.user.Auth);
goog.exportSymbol('ssd.user.isAuthed', ssd.user.Auth.isAuthed);
goog.exportSymbol('ssd.user.isExtAuthed', ssd.user.Auth.isExtAuthed);
goog.exportSymbol('ssd.user.isVerified', ssd.user.Auth.isVerified);
goog.exportSymbol('ssd.user.logout', ssd.user.Auth.logout);

// external auth
goog.exportSymbol('ssd.user.facebook.login', ssd.user.auth.Facebook.prototype.login);
goog.exportSymbol('ssd.user.facebook.logout', ssd.user.auth.Facebook.prototype.logout);

goog.exportSymbol('ssd.user.twitter.logout', ssd.user.auth.Twitter.prototype.logout);
goog.exportSymbol('ssd.user.twitter.logout', ssd.user.auth.Twitter.prototype.logout);

// modules
goog.exportSymbol('ssd.metrics.trackEvent', ssd.metrics.trackEvent);
goog.exportSymbol('ssd.metrics.trackMetrics', ssd.metrics.trackMetrics);
goog.exportSymbol('ssd.metrics.trackPageview', ssd.metrics.trackPageview);


if (!COMPILED) {
  goog.exportSymbol('s', ssd.Core.getInstance);
}