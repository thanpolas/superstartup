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
 * @license Apache License, Version 2.0
 * @copyright  (C) 2000-2010 Athanasios Polychronakis - All Rights Reserved
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * @createdate 03/Mar/2010
 * @package core JS framework
 *
 *********
 *  File:: main.js
 *  Core main bundler
 *********
 * 
 */

/**
 * Init the geowarp object
 *
 * @public
 */
goog.provide('core');

goog.provide('core.DEBUG');
goog.provide('core.READY'); //DOM ready switch


goog.require('goog.debug');
goog.require('goog.debug.LogManager');
goog.require('goog.debug.Logger');

goog.require('core.analytics');
goog.require('core.date');
goog.require('core.error');

goog.require('core.ajax');
goog.require('core.ready');

goog.require('core.user');
goog.require('core.conf');
goog.require('core.valid');
goog.require('core.web2');
goog.require('core.STATIC');
goog.require('core.throttle');


/**
 * Debuging option, set to false for production
 * @define {boolean}
 */
core.DEBUG = true;

/**
 * ONSERVER switch.
 * @define {boolean}
 */
core.ONSERVER = false;

/**
 * Pre - production switch
 * @define {boolean}
 */
core.PREPROD = false;

/**
 * Mobile application mode
 *
 * @define {boolean}
 */
core.MOBILE = false;

/**
 * WEB app mode
 *
 * @define {boolean}
 */
core.WEB = false;

/**
 * If we have tracking (on web production)
 *
 *
 */

if (core.ONSERVER)
  core.WEBTRACK = true;
else
  core.WEBTRACK = false;




/**
 * Shortcut assign google's getLogger method to ours
 *
 */
core.log = goog.debug.Logger.getLogger;

//Test if mw namespace exists and set our WEB / MOBILE constants
try {
    if (mw.DEBUG);
    core.MOBILE = true;
    core.WEB = false;
} catch(e) {
    core.MOBILE = false;
    core.WEB = true;
}


/**
 * Switch to true when DOM fires the ready() event
 * @define {boolean}
 */
core.READY = false;

/**
 * Global db (hash of values)
 *
 */
core.db = {};

/**
 * The geowarp Init function should be called whenever
 * our environment is loaded and ready.
 *
 * We will fire the web 2.0 APIs
 * and start the initAuthstate timeout
 *
 * @return {void}
 */
core.Init = function ()
{
    var g = goog;
    var c = core;

    c.ready('main');
    c.ready.addCheck('main', 'loaded');
    
    // the ready trigger for every other functionality beyond the framework
    c.ready('ready');
    c.ready.addCheck('ready', 'alldone');
    // for now this watch is finished at the end of taglander parse...


    c.web2.events.addEvent('initAuthState', function (state){
      // we don't care for the state, just state that we are finished

    });

    c.READY = true;
    c.ready.check('main', 'loaded');

}; // function core.Init

/**
 * Wrapper for goog.array.find
 * Will search each element of an array and
 * match the object key 'key' with 'value'
 * On Match we will return the element content
 *
 * e.g. var ind = core.arFind(ar, 'userId', userIdvar);
 *
 * @param {array} ar The array
 * @param {string} key The object key we will query
 * @param {mixed} value The value we are looking for
 * @return {array|null} The first array element that passes the test, or null if no element is found.
 */
core.arFind = function (ar, key, value)
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
 * e.g. var ind = core.arFindIndex(ar, 'userId', userIdvar);
 *
 * @param {array} ar The array
 * @param {string} key The object key we will query
 * @param {mixed} value The value we are looking for
 * @return {number} -1 for fail. The index of the first array element that passes the test, or -1 if no element is found.
 */
core.arFindIndex = function (ar, key, value)
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
core.arRemove = function (ar, key, value)
{
    if (!goog.isArray(ar)) return false;
    return goog.array.removeIf(ar, function(el, i, ar){
        if (el[key] == value) return true;
        return false;
    });
}; // method core.arRemove

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
core.arInArrayIndex = function (ar, value)
{
    var ret = -1;
    goog.array.forEach(ar, function (val, index){
        if (val == value)
            ret = index;
    });
    // not found
    return ret;

}; // core.arInArrayIndex


/**
 * Determines if the given object is a valid
 * jQuery array
 *
 * @param {mixed} ar The object we want to examine
 * @return boolean
 */
core.isjQ = function (ar)
{
  try {
    // for some reason a selection of a jQuery object now returns object (!)
    // check on that when have time (ahahaha)
    if (!goog.isArray(ar) && !goog.isObject(ar)) return false;

    if (goog.isString(ar.jquery)) return true;

    return false;
  } catch(e) {
    core.error(e);
    return false;
  }
}; // method core.isjQ

/**
 * Will count an objects element
 *
 * @param {Object} obj any object
 * @return {int}
 */
core.objCount = function (obj)
{
    var count = 0;
    goog.object.forEach(obj, function(){count++;});
    return count;

}; // method core.object

/**
 * Will reset all root elements of the passed
 * object. We check for the type of each element and
 * reset it properly as per type.
 *
 * If obj is an array, we examine the array elements
 * for reset (1 level up)
 *
 * @param {object|array} obj Object we want to reset
 * @return {object|array|null} Whatever is passed - reset - or null if not object/array
 */
core.resetAny = function (obj)
{
    var g = goog;

    // check if array
    if (g.isArray(obj)) {
        g.array.forEach(obj, function(el, index) {
            // we only examine objects
            if (g.isObject(el)) {
                obj[index] = _reset(el);
            }
        });
        return obj;
    }

    // check if object
    if (g.isObject(obj)) {
        obj = _reset(obj);
        return obj;
    }

    // default
    return null;

    /**
     * The actual payload of the reset method
     *
     * We do the type checks, reset the object
     * and return it
     *
     * @param {Object} actualObj This needs to be an object
     * @return {Object} The object reset
     */
    function _reset(actualObj) {

        g.object.forEach(actualObj, function(el, i){
            switch(goog.typeOf(el)) {
                case 'array': actualObj[i] = []; break;
                case 'string': actualObj[i] = ''; break;
                case 'boolean': actualObj[i] = false; break;
                case 'function': actualObj[i] = function(){}; break;
                case 'number': actualObj[i] = 0;
                case 'null': actualObj[i] = null;
                default: actualObj[i] = null; break;

           }
        });
        return actualObj;
    }


}; // method core.ui.ctrl.db_con

/**
 * Will calculate w,h dimentions based on
 * resizeTarget. We need an object in the form of:
 * obj_dims = {w:200, h:200)
 *
 * @param {number} resizeTarget The resize target
 * @param {Object} obj_dims object containing w and h keys with number values
 * @return {Object} containing w, h keys and anything else that wass passed
 */
core.resizePixels = function (resizeTarget, obj_dims)
{
    if (obj_dims.w > obj_dims.h)
        var imax = obj_dims.w;
    else
        var imax = obj_dims.h;

    if (0 === obj_dims.w) {
        obj_dims.w = resizeTarget;
    } else {
        obj_dims.w = obj_dims.w / (imax / resizeTarget);
        obj_dims.h = obj_dims.h / (imax / resizeTarget);
    }

    return obj_dims;
};


/**
 * Will make all root elements of a given object
 * have value null
 *
 * @return {void}
 */
core.nullify = function (obj)
{

    goog.object.forEach(obj, function(item, index){
        obj[index] = null;
    });
}; // method nullify

/**
 * Decode a URI string
 *
 * @param {string}
 * @return {string}
 */
core.decURI = function(str){
    var g = goog;
    var log = goog.debug.Logger.getLogger('core.decURI');

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
core.encURI = function(str){

    var g = goog;
    var log = goog.debug.Logger.getLogger('core.encURI');

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
core.decEnt = function(str) {
    var g = goog;
    var log = goog.debug.Logger.getLogger('core.decEnt');

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
core.encEnt = function(str) {
    var g = goog;
    var log = g.debug.Logger.getLogger('core.encEnt');

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
 * Generic Wrapper method for decoding strings
 * as sent from the geowarp server.
 *
 * We use this method so if something changes in the
 * future, transition will be easy
 *
 * For now we decode HTML entities
 *
 * @param {string}
 * @return {string}
 */
core.decSrv = function (str) {return core.decEnt(str);};

/**
 * Will return the current domain name of the site
 * e.g. core.local, core.com ...
 *
 * @return {string}
 */
core.getDomain = function()
{
    var g = goog;
    var uri = new g.Uri(document.location.href);
    return uri.getDomain();
}; // method core.getDomain


/**
 * Read a page's GET URL variables and return them as an associative array.
 * From: http://snipplr.com/view/799/get-url-variables/
 *
 * @return {array}
 */
core.getUrlVars = function()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        //hash = {hash[0]:hash[1]};
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }

    return vars;
}; // method core.getUrlVars

/**
 * Checks if an object is empty
 * From: http://code.google.com/p/jslibs/wiki/JavascriptTips
 *
 * @param {obj}
 * @return {boolean}
 */
core.isNotEmpty = function (obj) {
    for (var i in obj)
        return true;

    return false;
};

/**
 * Return true/false if user is authenticated
 * @return {boolean}
 */
core.isAuthed = function () {
    //return true;
    return core.user.auth.isAuthed();
};



/**
 * Return a copy of the value provided
 *
 * @param {mixed} val
 * @return {mixed} whatever is passed for copy
 */
core.copy = function (val){return val;};



/**
 * Checks if a value (needle) is within the provided other parameters
 *
 * e.g. if (core.inValue('a', 'b', 'c', 'z')) is false...
 *
 * @param {mixed} needle Value we want to look for
 * @param {...*=} opt_var_args Additional arguments that are used to compare
 *      our needle value against
 * @return {boolean}
 */
core.inValue = function (needle, opt_var_args)
{

    var len = arguments.length;
    var haystack = [];

    for (var start = 1; start < len ; start++)
        haystack.push(arguments[start]);

    if (-1 === haystack.indexOf(needle))
        return false;

    return true;

}; // function core.inValue


/**
 * Poor implementation of PHP explode
 * we split a given string by the seperator
 *
 * we return an array with the values
 *
 * if no seperator is found within the string we return
 * an array with a single value
 *
 * @param {string} seperator The seperator
 * @param {string} stringValue The string we want to split
 * @return {Array}
 */
core.explode = function ( seperator, stringValue)
{
    return stringValue.split(seperator);
}; // function core.explode

/**
 * Will mix (fuse) two objects.
 *
 * Put target object on first parameter
 *
 * @param {object} objTarget The target object we want to mix to
 * @param {object} objData The new object we want to mix
 * @return {void}
 */
core.objMix = function (objTarget, objData)
{
    var g = goog;

    if (!g.isObject(objTarget) || !g.isObject(objData))
        return;

    g.object.forEach(objData, function(obj, index){
        if (!g.isDef(objTarget[index]))
            objTarget[index] = obj;
    });

};

/**
 * An alternative non-regexp idiom for simple global string replace is:
 *
 * snippet from: http://stackoverflow.com/questions/252924/javascript-how-to-replace-a-sub-string
 *
 * @param {string} haystack
 * @param {string} find
 * @param {string} sub
 * @return {string}
 */
core.string_replace = function(haystack, find, sub) {
  try {
    return haystack.split(find).join(sub);
  } catch(e) {core.error(e); return haystack;}
}