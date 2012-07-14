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
 * createdate 05/Jul/2010
 *
 *********
 *  File:: system/error.js  
 *********
 */
 
 /**
  * @fileoverview Error handling functions
  */
goog.provide('ss.error');



/**
 * Hook for try{}catch(e) statements
 *
 * @param {Object} e error object
 * @return {void}
 */
ss.error = function (e)
{
    var logger = goog.debug.Logger.getLogger('ss.error');
    var filename, line, msg, source, name;
    //logger.info(g.debug.expose(e));
    /*
    if (ss.MOBILE) {
        filename = e.name;
        line = e.line;
        msg = e.message;
        source = e.sourceURL;
    } else {
    */
    name = e.name;
    if (e.fileName) {
      filename = e.fileName;
      line = e.lineNumber;
      msg = e.message;
      source = '';
    } else {
      filename = e.stack.split("\n")[1];
      line = '';
      msg = e.message;
      source = '';
    }
  
    
    var errMsg = 'Error! name:' + name + ' Filename:' + filename + ' line:' + line + ' msg:' + msg + ' source:' + source;
    logger.severe(errMsg);
    if (console) { 
      console.debug(errMsg);
    }
    
}; // method ss.error

