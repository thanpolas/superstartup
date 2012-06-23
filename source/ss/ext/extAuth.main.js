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
 * createdate 29/Oct/2010
 */

 /**
  * @fileoverview main file for social integration libraries (auth/share/etc)
  */


goog.provide('ss.ext.auth.Main');
goog.provide('ss.ext.auth.Error');
goog.provide('ss.ext.auth.EventType');

goog.require('ss.Map');
goog.require('ss.user');
goog.require('ss.Module');
goog.require('goog.object');

/**
 *
 * @constructor
 * @extends {ss.Module}
 */
ss.ext.auth.Main = function()
{
  goog.base(this);
};
goog.inherits(ss.ext.auth.Main, ss.Module);
goog.addSingletonGetter(ss.ext.auth.Main);


/**
 * We will return one external source data object
 * from the user data object provided.
 *
 * Optionaly we may set a preffered source
 *
 * We return an object with these keys:
  [sourceId] => 6
  [extUserId] => 47002318
  [extUrl] => http://twitter.com/thanpolas
  [extUsername] => thanpolas
  [extProfileImageUrl] => 'htpt:/...'

 *
 * @param {Object} userObj The user data object
 * @param {ss.CONSTS.SOURCES} opt_prefferedSource
 * @return {Object}
 */
ss.ext.auth.Main.prototype.getUserExt = function(userObj, opt_prefferedSource)
{
  var prefSource = opt_prefferedSource || ss.CONSTS.SOURCES.FB;
  var extObj = {};
  var foundPref = false;

  if (!goog.isArray(userObj.extSource)) {
    // got a broken object...
    var user = ss.user.getDummyObject();
    return user.extSource[0];
  }

  goog.array.forEach(userObj.extSource, function (extSource, index){
    if (foundPref) return;
    extObj =  ss.copy(extSource);
    if (prefSource == extSource.sourceId)
      foundPref = true;
  });

  return extObj;
};
