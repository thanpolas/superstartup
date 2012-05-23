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
 * createdate 20/May/2012
 *
 *********
 *  File:: helpers.js
 *  Helper functions
 *********
 * 
 */
 
goog.provide('ss.helpers');
 
 
goog.require('ss.date');
goog.require('goog.array');
goog.require('goog.object');
 
 /**
  * Wrapper for goog.array.find
  * Will search each element of an array and
  * match the object key 'key' with 'value'
  * On Match we will return the element content
  *
  * e.g. var ind = ss.arFind(ar, 'userId', userIdvar);
  *
  * @param {array} ar The array
  * @param {string} key The object key we will query
  * @param {mixed} value The value we are looking for
  * @return {array|null} The first array element that passes the test, or null if no element is found.
  */
 ss.arFind = function (ar, key, value)
 {
     var g = goog;

     // check if we have an array
     if (!g.isArray(ar)) {
         // not an array, force it into one
         ar = g.object.getValues(ar);
     }
     return g.array.find(ar, function(el, i, ar){
         if (el[key] == value) return true;
         return false;
     });
 }; // method arFind

 /**
  * Wrapper for goog.array.findIndex
  * Will search each element of an array and
  * match the object key 'key' with 'value'
  * On Match we will return the element index
  *
  * e.g. var ind = ss.arFindIndex(ar, 'userId', userIdvar);
  *
  * @param {array} ar The array
  * @param {string} key The object key we will query
  * @param {mixed} value The value we are looking for
  * @return {number} -1 for fail. The index of the first array element that passes the test, or -1 if no element is found.
  */
 ss.arFindIndex = function (ar, key, value)
 {
     if (!goog.isArray(ar)) return -1;
     return goog.array.findIndex(ar, function(el, i, ar){
         if (el[key] == value) return true;
         return false;
     });
 }; // method arFindIndex



 /**
  * Wrapper for goog.array.removeIf
  * Will search each element of an array
  * and if it finds a match for the object key
  * we provided it, it then removes this element
  * from the array
  *
  * @param {array} ar The array
  * @param {string} key The object key we will query
  * @param {mixed} value The value we are looking for
  * @return boolean  True if an element was removed.
  */
 ss.arRemove = function (ar, key, value)
 {
     if (!goog.isArray(ar)) return false;
     return goog.array.removeIf(ar, function(el, i, ar){
         if (el[key] == value) return true;
         return false;
     });
 }; // method ss.arRemove

 /**
  * Determines if the given object is a valid
  * jQuery array or the jQuery function
  *
  * @param {mixed} ar The object we want to examine
  * @return boolean
  */
 ss.isjQ = function (ar)
 {
   try {
     if (goog.isFunction(ar))
       return ar == jQuery;
     return ar instanceof jQuery;
   } catch(e) {
     ss.error(e);
     return false;
   }
 }; // method ss.isjQ

 /**
  * Decode a URI string
  *
  * @param {string}
  * @return {string}
  */
 ss.decURI = function(str){
     var g = goog;

     if (g.isNull(str)) return '';

     try {
         var ret = decodeURIComponent(str);
     }
     catch(e){
         return str;
     }
     return ret;
 };

 /**
  * Encode a URI string
  *
  * @param {string}
  * @return {string}
  */
 ss.encURI = function(str){

     var g = goog;
     if (g.isNull(str)) return '';
     try {
         var ret = encodeURIComponent(str);
     }
     catch(e){
         return str;
     }
     return ret;

 };

 /**
  * Decode html Entities
  *
  * @param {string}
  * @return {string}
  */
 ss.decEnt = function(str) {
     var g = goog;
     if (g.isNull(str)) {
         return '';
     }

     try {
         var ret = g.string.unescapeEntities(str);
     }
     catch(e){
         return str;
     }
     return ret;

 };

 /**
  * Encode html Entities
  *
  * @param {string}
  * @return {string}
  */
 ss.encEnt = function(str) {
     var g = goog;
     if (g.isNull(str)) return '';

     try {
         var ret = g.string.htmlEscape(str);
     }
     catch(e){
         return str;
     }
     return ret;

 };


 /**
  * Will return the current domain name of the site
  * e.g. ss.local, ss.com ...
  *
  * @return {string}
  */
 ss.getDomain = function()
 {
     return new goog.Uri(document.location.href).getDomain();
 }; // method ss.getDomain


 /**
  * Read a page's GET URL variables and return them as an associative array.
  * From: http://snipplr.com/view/799/get-url-variables/
  *
  * @return {array}
  */
 ss.getUrlVars = function()
 {
     var vars = [], hash;
     var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

     for(var i = 0; i < hashes.length; i++)
     {
         hash = hashes[i].split('=');
         vars.push(hash[0]);
         vars[hash[0]] = hash[1];
     }

     return vars;
 }; // method ss.getUrlVars

 /**
  * Checks if an object is empty
  * From: http://code.google.com/p/jslibs/wiki/JavascriptTips
  *
  * @param {obj}
  * @return {boolean}
  */
 ss.isNotEmpty = function (obj) {
     for (var i in obj)
         return true;
     return false;
 };

 /**
  * Return true/false if user is authenticated
  * @return {boolean}
  */
 ss.isAuthed = function () {
     //return true;
     return ss.user.auth.isAuthed();
 };

 /**
  * Checks if a value (needle) is within the provided other parameters
  *
  * e.g. if (ss.inValue('a', 'b', 'c', 'z')) is false...
  *
  * @param {mixed} needle Value we want to look for
  * @param {...*=} opt_var_args Additional arguments that are used to compare
  *      our needle value against
  * @return {boolean}
  */
 ss.inValue = function (needle, opt_var_args)
 {
     var len = arguments.length;
     var haystack = [];

     for (var start = 1; start < len ; start++)
         haystack.push(arguments[start]);

     if (-1 === haystack.indexOf(needle))
         return false;

     return true;

 };
 