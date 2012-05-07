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
 * createdate 03/Mar/2010
 * @package Superstartup framework
 *
 *********
 *  File:: main.js
 *  
 *********
 * 
 */

goog.provide('ss');

goog.provide('ss.DEBUG');
goog.provide('ss.READY'); //DOM ready switch


goog.require('goog.debug');
goog.require('goog.debug.LogManager');
goog.require('goog.debug.Logger');

goog.require('ss.analytics');
goog.require('ss.date');
goog.require('ss.error');

goog.require('ss.ajax');
goog.require('ss.ready');
goog.require('ss.events');
goog.require('ss.user');
goog.require('ss.conf');
goog.require('ss.valid');
goog.require('ss.web2');
goog.require('ss.STATIC');


/**
 * Debuging option, set to false for production
 * @define {boolean}
 */
ss.DEBUG = true;

/**
 * ONSERVER switch.
 * @define {boolean}
 */
ss.ONSERVER = false;

/**
 * Pre - production switch
 * @define {boolean}
 */
ss.PREPROD = false;

/**
 * Mobile application mode
 *
 * @define {boolean}
 */
ss.MOBILE = false;

/**
 * WEB app mode
 *
 * @define {boolean}
 */
ss.WEB = false;

/**
 * If we have tracking (on web production)
 *
 *
 */

if (ss.ONSERVER)
  ss.WEBTRACK = true;
else
  ss.WEBTRACK = false;




/**
 * Shortcut assign google's getLogger method to ours
 *
 */
ss.log = goog.debug.Logger.getLogger;


ss.MOBILE = false;
ss.WEB = true;


/**
 * Switch to true when DOM fires the ready() event
 * @define {boolean}
 */
ss.READY = false;

/**
 * Global db (hash of values)
 *
 */
ss.db = {};

/**
 * The geowarp Init function should be called whenever
 * our environment is loaded and ready.
 *
 *
 * @return {void}
 */
ss.Init = function ()
{
    var s = ss;

    s.ready('main');
    s.ready.addCheck('main', 'loaded');
    
    // the ready trigger for every other functionality beyond the framework
    s.ready('ready');
    // for now this watch is finished at the end of taglander parse...    
    s.ready.addCheck('ready', 'alldone');

    s.READY = true;
    s.ready.check('main', 'loaded');

}; // function ss.Init

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
 * Checks if a specific itam (value) exists in an array
 *
 * if it does, we return the index, else we return -1
 *
 * We only search in first level
 *
 * @param {array} ar The array we want to search inside
 * @param {*} value The value we are looking for
 * @return {number} -1 if not found or index
 */
ss.arInArrayIndex = function (ar, value)
{
    var ret = -1;
    goog.array.forEach(ar, function (val, index){
        if (val == value)
            ret = index;
    });
    // not found
    return ret;

}; // ss.arInArrayIndex


/**
 * Determines if the given object is a valid
 * jQuery array
 *
 * @param {mixed} ar The object we want to examine
 * @return boolean
 */
ss.isjQ = function (ar)
{
  try {
    // for some reason a selection of a jQuery object now returns object (!)
    // check on that when have time (ahahaha)
    if (!goog.isArray(ar) && !goog.isObject(ar)) return false;

    if (goog.isString(ar.jquery)) return true;

    return false;
  } catch(e) {
    ss.error(e);
    return false;
  }
}; // method ss.isjQ

/**
 * Will count an objects element
 *
 * @param {Object} obj any object
 * @return {int}
 */
ss.objCount = function (obj)
{
    var count = 0;
    goog.object.forEach(obj, function(){count++;});
    return count;

}; // method ss.object

/**
 * Decode a URI string
 *
 * @param {string}
 * @return {string}
 */
ss.decURI = function(str){
    var g = goog;
    var log = goog.debug.Logger.getLogger('ss.decURI');

    if (g.isNull(str)) return '';

    try {
        var ret = decodeURIComponent(str);
    }
    catch(e){
        log.severe('decodeURIComponent failed for string:' + str + ' message:' + e.message);
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
    var log = goog.debug.Logger.getLogger('ss.encURI');

    if (g.isNull(str)) return '';

    try {
        var ret = encodeURIComponent(str);
    }
    catch(e){
        log.severe('encodeURIComponent failed for string:' + str + ' message:' + e.message);
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
    var log = goog.debug.Logger.getLogger('ss.decEnt');

    if (g.isNull(str)) {
        return '';
    }

    try {
        var ret = g.string.unescapeEntities(str);
    }
    catch(e){
        log.severe('goog.string.unescapeEntities failed for string:' + str + ' message:' + e.message);
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
    var log = g.debug.Logger.getLogger('ss.encEnt');

    if (g.isNull(str)) return '';

    try {
        var ret = g.string.htmlEscape(str);
    }
    catch(e){
        log.severe('goog.string.htmlEscape failed for string:' + str + ' message:' + e.message);
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
    var d = document;
    var g = d.goog;
    var uri = new g.Uri(d.location.href);
    return uri.getDomain();
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

}; // function ss.inValue

