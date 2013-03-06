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
goog.require('ssd.user.Auth');
goog.require('ssd.user.auth.Facebook');
goog.require('ssd.user.auth.Twitter');

// core
goog.exportSymbol('ss', ss);
goog.exportSymbol('ss.init', ss.init);

// core methods
goog.exportSymbol('ss.isReady', ss.isReady);
goog.exportSymbol('ss.config', ss.config);
goog.exportSymbol('ss._getResponse', ssd._getResponse);

// net
goog.exportSymbol('ss.ajax', ssd.ajax);
goog.exportSymbol('ss.ajax.send', ssd.ajax.send);
goog.exportSymbol('ss.sync', ssd.sync);
goog.exportSymbol('ss.sync.send', ssd.sync.send);

// net response object
goog.exportSymbol('ss.sync.Response', ssd.sync.Response);
goog.exportSymbol('ss.sync.Response.prototype.httpStatus', ssd.sync.Response.prototype.httpStatus);
goog.exportSymbol('ss.sync.Response.prototype.success', ssd.sync.Response.prototype.success);
goog.exportSymbol('ss.sync.Response.prototype.responseRaw', ssd.sync.Response.prototype.responseRaw);
goog.exportSymbol('ss.sync.Response.prototype.errorMessage', ssd.sync.Response.prototype.errorMessage);
goog.exportSymbol('ss.sync.Response.prototype.xhr', ssd.sync.Response.prototype.xhr);


// events
goog.exportSymbol('ss.listen', ss.listen);
goog.exportSymbol('ss.trigger', ss.trigger);
goog.exportSymbol('ss.unlisten', ss.unlisten);
goog.exportSymbol('ss.removeAllListeners', ss.removeAllListeners);

// user
goog.exportSymbol('ss.user', ss.user);
goog.exportSymbol('ss.isAuthed', ss.isAuthed);
goog.exportSymbol('ss.user.isAuthed', ss.user.isAuthed);
goog.exportSymbol('ss.user.auth', ss.user.auth);
goog.exportSymbol('ss.user.deAuth', ss.user.deAuth);
goog.exportSymbol('ss.user.isExtAuthed', ss.user.isExtAuthed);
goog.exportSymbol('ss.user.login', ss.user.login);
goog.exportSymbol('ss.user.logout', ss.user.logout);

// auth plugins
// goog.exportSymbol('ss.user.fb.login', ss.user.fb.login);
// goog.exportSymbol('ss.user.fb.logout', ss.user.fb.logout);
// goog.exportSymbol('ss.user.tw.logout', ss.user.tw.logout);
// goog.exportSymbol('ss.user.tw.logout', ss.user.tw.logout);

