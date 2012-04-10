/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
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
 * created on Aug 23, 2011
 * cookies.js Cookies management and operations
 *
 */


goog.provide('web.cookies');

goog.require('goog.net.Cookies');

web.cookies.gcls = new goog.net.Cookies(document);

web.cookies.isEnabled = function ()
{
  try {
    return (web.cookies.gcls.isEnabled());
  } catch (e) {
    core.error(e);
  }

}
