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
 * createdate 05/Jul/2010
 *
 *********
 *  File:: system/err.js  
 *  Error handling functions
 *********
 */


goog.provide('core.err');
goog.provide('core.error');

core.err = {};


/**
 * Hook or try{}catch(e) statements
 *
 * @param {object} e error object
 * @return {void}
 */
core.error = function (e)
{
    var g = goog;
    var log = g.debug.Logger.getLogger('core.error');

    //log.info(g.debug.expose(e));
    if (core.MOBILE) {
        var filename = e.name;
        var line = e.line;
        var msg = e.message;
        var source = e.sourceURL;
    } else {
      if (e.fileName) {
        var filename = e.fileName;
        var line = e.lineNumber;
        var msg = e.message;
        var source = '';
      } else {
        filename = e.stack.split("\n")[1];
        var line = '';
        var msg = e.message;
        var source = '';
      }
    }
    log.severe('Error! name:' + filename + ' line:' + line + ' msg:' + msg + ' source:' + source);
    if (core.WEB && console) { 
      console.debug('Error! name:' + filename + ' line:' + line + ' msg:' + msg + ' source:' + source);
    }
    
}; // method core.error



/**
 * Container for the error message
 */
core.err.msg = '';

/**
 * Simple setter for error message
 */
core.err = function(msg) {
    core.err.msg = msg;
};

/**
 * Simple getter for error message
 */
core.err.get = function () {
    return core.err.msg;
};
