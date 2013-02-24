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
goog.require('ssd.Core');
goog.require('ssd.core');
goog.require('ssd.user.Auth');
goog.require('ssd.user.auth.Facebook');
goog.require('ssd.user.auth.Twitter');

// core
goog.exportSymbol('ss', goog.bind(ssd.core.init, ssd.core));
goog.exportSymbol('ss.init', goog.bind(ssd.core.init, ssd.core));

goog.exportSymbol('ss.isReady', goog.bind(ssd.core.isReady, ssd.core));

// user
goog.exportSymbol('ss.user', ssd.core.user);
goog.exportSymbol('ss.user.isAuthed', ssd.user.Auth.prototype.isAuthed);
goog.exportSymbol('ss.isAuthed', ssd.user.Auth.prototype.isAuthed);
goog.exportSymbol('ss.user.isExtAuthed', ssd.user.Auth.prototype.isExtAuthed);
goog.exportSymbol('ss.user.isVerified', ssd.user.Auth.prototype.isVerified);
goog.exportSymbol('ss.user.logout', ssd.user.Auth.prototype.logout);

// external auth
goog.exportSymbol('ss.user.facebook.login', ssd.user.auth.Facebook.prototype.login);
goog.exportSymbol('ss.user.facebook.logout', ssd.user.auth.Facebook.prototype.logout);

goog.exportSymbol('ss.user.twitter.logout', ssd.user.auth.Twitter.prototype.logout);
goog.exportSymbol('ss.user.twitter.logout', ssd.user.auth.Twitter.prototype.logout);

// modules
goog.exportSymbol('ss.metrics.trackEvent', ssd.metrics.trackEvent);
goog.exportSymbol('ss.metrics.trackMetrics', ssd.metrics.trackMetrics);
goog.exportSymbol('ss.metrics.trackPageview', ssd.metrics.trackPageview);
