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
 * createdate 08/Sep/2011
 *
 *********
 *  File:: user/pub.user.js
 *  User public functions (a user requesting data for another user)
 *********
 */


goog.provide('ss.user.pub');



/**
 * Retrieve a user's public data object from server
 *
 * @param {string} nickname user's nickname
 * @param {Function(boolean, string|object)} cb Callback function, first
 *    param is status (ok / not ok) second is error msg or user data
 *    object as returned from server
 * @return {void}
 */
ss.user.pub.get = function(nickname, cb)
{
  try {
    var c = ss;

    var aj = new c.ajax('/userp/get', {
      postMethod: 'POST'
    });

    // add our query data
    aj.addData('nickname', nickname);

    // ajax callback listener
    aj.callback = function (result)
    {
      try {
        if (20 == result['status']) {
          cb(false, 'no results');
          return;
        }
        if (10 != result['status']) {
          cb(false, 'other error');
          return;
        }

        var u = result['user'];
        if (c.user.isUserObject(u)) {
          cb(true, u);
          return;
        }

        // not valid user object
        cb(false, 'not valid user object received');


      } catch(e) {

        ss.error(e);
        cb(false, 'other error1');
      }
    };

    // ajax error listener
    aj.errorCallback = function (errorobj)
    {
      try {
      // errorobj.message
      // errorobj.debugmessage
      cb(false, errorobj.message);

      } catch (e) {
        ss.error(e);
      }

    };

    // send ajax request
    aj.send();


  } catch (e) {
    ss.error(e);

    cb(false, 'other error2');
  }

};