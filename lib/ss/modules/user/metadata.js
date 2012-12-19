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
 * created on Sep 27, 2011
 */
 
 /**
  * @fileoverview Meta Data library. Stores and gets data persistently to the server
  * 
  */



goog.provide('ssd.metadata');


/**
 * The static data object of metadata
 * @type {object}
 * @private
 */
ssd.metadata.db = {
  source: '',
  permId: 0,
  createDate: null,
  visitCounter: 0, // total visits to the site
  metadata: null, // null or decoded JSON string == object
  sessionStart: null, // when this session started - unix timestamp
  pageviews: 0, // how many pageviews user created
  
  /**
   * The namespace (name) we'll use for local storage
   * @const {string}
   */
  STORE_NAMESPACE: 'SS_METADATA',

  /** @type {boolean} switch to let us know if we have done an initial load */
  initialLoad: false,

  /** 
   * @private
   * @type {boolean} Switch to false when saving session data internally 
   */
  sessionSafetySwitch: true
};

/** @typedef {
  source: string, 
  permId: number,
  createDate: number,
  visitCounter: number,
  ifFirstTime: boolean,
  metadata: object
  } */
ssd.metadata.metadataRoot;

/**
 * Receive and parse the metadataRoot Object from the server
 *
 * @param {ssd.metadata.metadataRoot} metadataRoot
 * @return {void}
 */
ssd.metadata.init = function (metadataRoot)
{
  try {
    if (goog.DEBUG) {
      var logger = goog.debug.Logger.getLogger('ssd.metadata.init');
      logger.info('metadataRoot:' + goog.debug.deepExpose(metadataRoot));
    }
    if (!ssd.metadata.validate(metadataRoot))
      return;
    
    var db = ssd.metadata.db;
    // there are cases where we may call .init() twice
    // we want the isFirstTime to remain true if it was set to true
    db.isFirstTime = db.isFirstTime || metadataRoot['isFirstTime'];
    db.source = metadataRoot['source'];
    db.permId = metadataRoot['permId'];
    db.createDate = metadataRoot['createDate'];
    db.visitCounter = metadataRoot['visitCounter'];
    // now try to JSON decode the metadata
    try {
      db.metadata = JSON.parse(metadataRoot['metadata']);
    } catch(e) {
      db.metadata = {};
    }
    db.pageviews++; // add up pageviews
    
    if (db.isFirstTime)
      db.sessionStart = new Date().getTime();

    goog.DEBUG && ssd.canLog && logger.info('Parsed new metadataObject. source:' + db.source + ' permId:' + db.permId);

  } catch (e) {
    ssd.error(e);
  }

};

/**
 * Validate if a metadata object is proper
 * @param {ssd.metadata.metadataRoot}
 * @return {boolean}
 */
ssd.metadata.validate = function(metadataRoot)
{
  if (!goog.isNumber(metadataRoot['permId']))
    return false;
    
  if (0 >= metadataRoot['permId'])
    return false;
    
  return true;
};

/**
 * Will save a new value to the specified key
 *
 * We will also save on server
 *
 * We only save on the masterkey 'metadata' in our db
 *
 * @param {function(boolean)=} opt_callback listen on the async server reply
 * @return {void}
 */
ssd.metadata.save = function (opt_callback)
{
  try {

    var logger = goog.debug.Logger.getLogger('ssd.metadata.save');

    logger.info('Saving metadata to server');
    var db = ssd.metadata.db,
    cb = opt_callback || function(){};

    // check if we have a null metadata object
    if (goog.isNull(db.metadata))
      db.metadata = {};

    var aj = new ssd.ajax('/md/save', {
      postMethod: 'POST'
    });

    aj.addData('metadata', JSON.stringify(db.metadata));

    // ajax callback listener
    aj.callback = function (res){cb(res.status);};

    // ajax error listener
    aj.errorCallback = function (errorobj) {cb(false);};

    // send ajax request
    aj.send();


  } catch (e) {
    ssd.error(e);
    cb(false);
  }

};




/**
 * Set a value to the key specified.
 *
 * We blindly overwrite any previous values
 *
 * Input keys as if you are refering to object paths separated with dots
 * e.g.: 'guest.location.city'
 *
 * @param {string} key The key to save the value for
 * @param {*} value the value we want to store. Can be anything
 * @param {boolean=} opt_save Optionaly declare if we want to auto-save the
 *      value to the server
 * @return {boolean}
 */
ssd.metadata.set = function(key, value, opt_save) {
    try {
    // some plain validations
    if('string' != typeof key)
        return false;
    if ('undefined' == goog.typeOf(value))
        return false;
    // split the string using dots
    var parts = key.split('.');

    if (!ssd.metadata._resolvePath(parts, ssd.metadata.db.metadata, {isSet:true}, value))
        return false;
        
    return true;
    }catch(e){return false;}
};

/**
 * Get a stored value.
 *
 * Treat storage as you would a typical JS Object / hash, e.g.
 * 'guest.location.city' would return the city value
 * 'guest' would return the full guest object
 *
 * @param {string} key
 * @return {*} boolean false if operation failed, null if value not found
 */
ssd.metadata.get = function(key) {
  try {
    if('string' != typeof key)
        return false;
    // check if we have loaded data and are ready to serve
    if (!ssd.metadata.db.initialLoad)
        return false;
    // split the string using dots
    var parts = key.split('.');

    var result = ssd.metadata._resolvePath(parts, ssd.metadata.db.metadata, {isGet:true});
    var type = goog.typeOf(result);
    if ('object' == type)
        return $.extend(true, {}, result);
    if ('array' == type)
        return $.extend(true, [], result);
    return result;
  } catch(e){ssd.error(e);}
};

/**
 * Remove (delete) a key from the storage
 *
 * @param {string} key
 * @return {void}
 */
ssd.metadata.remove = function(key) {
    ssd.metadata._resolvePath(key.split('.'), ssd.metadata.db.metadata, {isDel:true});
};

/**
 * Resolve the path to set/get on our data object
 * based on the given string.
 *
 * If we want to set the value, then if the path does not exist
 * we will create it as we dive in the object recursively.
 *
 * If we want to get the value and the path does not exist we will
 * return null
 *
 * @private
 * @param {array} parts Our path split into an array ['a','b','c'] --> a.b.c
 * @param {Object} obj The object we will dive into
 * @param {Object} An object containing a boolean true value for one of
 *          they following keys / operations:
 *          isSet if we want to SET a variable
 *          isGet if we want to GET a variable
 *          isDel if we want to DELETE a variable
 * @param {*=} opt_val If we want to set, include here the value
 * @return {*} The value we resolved
 */
ssd.metadata._resolvePath = function(parts, obj, op, opt_val) {
    var len = parts.length;
    var part = parts.shift();
    // check if we are in the last part of our path
    if (1 == len) {
        if (op.isSet) {
            // force overwrite
            obj[part] = opt_val;
            return true;
        }
        if (op.isDel) {
            delete obj[part];
        } else {
            return obj[part];
        }
    }
    if (obj[part] == null) {
        if (op.isSet) {
            obj[part] = {};
        } else {
            return null;
        }
    } else if(op.isSet && 'object' != goog.typeOf(obj[part])) {
        // This is the case where we want to SET a value
        // in a path and somewhere along the path we don't find an
        // object. In this case we have to overwrite whatever was
        // previously set as this is the described functionality
        obj[part] = {};
    }
    return ssd.metadata._resolvePath(parts, obj[part], op, opt_val);
};

/**
 * Get how many pageviews current visitor has done
 *
 * @return {Number}
 */
ssd.metadata.pageviews = function(){
    return ssd.metadata.db.pageviews;
};

/**
 * Get the total visits of the current visitor ever since he / she
 * came to the site
 *
 * @return {Number}
 */
ssd.metadata.totalvisits = function() {
    return ssd.metadata.db.visitCounter;
};




