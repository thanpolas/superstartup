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
 * created on Aug 23, 2011
 * cookies.js Cookies management and operations
 *
 */


goog.provide('ss.web.cookies');

// Don't utilize goog's cookie class, we only want to test if cookies
// are enabled.
//goog.require('goog.net.Cookies');
//ss.web.cookies.gcls = new goog.net.Cookies(document);

/**
 * Determine if the browser is cookie enabled
 *
 * Code snippet from:
 * http://www.javascriptkit.com/javatutors/cookiedetect.shtml
 * @return {boolean}
 */
ss.web.cookies.isEnabled = function ()
{
  try {
    var cookieEnabled = (navigator.cookieEnabled) ? true : false

    //if not IE4+ nor NS6+
    if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled ){ 
      document.cookie="testcookie"
      cookieEnabled = (document.cookie.indexOf("testcookie") != -1)? true : false;
    }
    return cookieEnabled;
  } catch (e) {
    ss.error(e);
  }

};
