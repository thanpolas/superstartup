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
 * @license Apache License, Version 2.0
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 19/May/2012
 *
 *********
 *  File:: exports.js
 *  Declare all the symbols we want to export
 *********
 * 
 */
goog.provide('ss.exports');
goog.require('ss.web.system.tagLander');

(function(goog){
  goog.exportSymbol('ss.tagLander', ss.web.system.tagLander);
  //goog.exportSymbol('ss.STATIC.SOURCES', ss.STATIC.SOURCES);
  //goog.exportProperty(ss.STATIC, 'zoo', ss.STATIC.zoo);
  window['ss']['taggg'] = ss.web.system.tagLander;
})(goog);
