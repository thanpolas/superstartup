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

// net
goog.exportSymbol('ss.ajax', ssd.ajax);
goog.exportSymbol('ss.ajax.send', ssd.ajax.send);
goog.exportSymbol('ss.sync', ssd.sync);
goog.exportSymbol('ss.sync.send', ssd.sync.send);

// events
goog.exportSymbol('ss.listen', ss.listen);
goog.exportSymbol('ss.trigger', ss.trigger);
goog.exportSymbol('ss.unlisten', ss.unlisten);
goog.exportSymbol('ss.removeAllListeners', ss.removeAllListeners);

// user
goog.exportSymbol('ss.ssd', ssd);
goog.exportSymbol('ss.ssd.user.AuthModel.prototype.isAuthed', ss.ssd.user.AuthModel.prototype.isAuthed);

// goog.exportSymbol('ss.user.isAuthed', ss.ssd.user.AuthModel.prototype.isAuthed);
// goog.exportSymbol('ss.isAuthed', ss.ssd.user.AuthModel.prototype.isAuthed);
goog.exportSymbol('ss.ssd.user.Auth.prototype.isExtAuthed', ss.ssd.user.Auth.prototype.isExtAuthed);
goog.exportSymbol('ss.ssd.user.Auth.prototype.login', ss.ssd.user.Auth.prototype.login);
goog.exportSymbol('ss.ssd.user.Auth.prototype.logout', ss.ssd.user.Auth.prototype.logout);

// auth plugins
// goog.exportSymbol('ss.user.fb.login', ss.user.fb.login);
// goog.exportSymbol('ss.user.fb.logout', ss.user.fb.logout);
// goog.exportSymbol('ss.user.tw.logout', ss.user.tw.logout);
// goog.exportSymbol('ss.user.tw.logout', ss.user.tw.logout);

