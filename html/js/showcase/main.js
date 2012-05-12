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
 *
 *
 *
 *********
 * Superstartup showcase bootstrap file
 *
 */

goog.provide('showcase');
goog.require('ss');

goog.require('showcase.widget.showObject');


ss.ready(function(){showcase.init();});


showcase.init = function() {
  try {
  var log = ss.log('showcase.init');
  
  var so = new showcase.widget.showObject();
  
  so.addObject('userObject', 'The user data object', 'ss.user.getUserDataObject()');
  log.info('run');
  log.info(so.objectItems);
  } catch(e) {ss.error(e);}
};