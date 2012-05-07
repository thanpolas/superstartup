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
 * metadata.js Meta Data handler
 *
 */

goog.provide('ss.metadata');
goog.provide('ss.user.metadata');
// do a shortcut assign till all references have been updated
ss.metadata = ss.user.metadata;

/**
 * The static data object of metadata
 *
 */
ss.user.metadata.db = {
  source: '',
  permId: 0,
  createDate: null,
  visitCounter: 0,
  metadata: null // null or decoded JSON string == object
}


/**
 * Receive and parse the metadataObject
 *
 * @param {object} dataobj
 * @return {void}
 */
ss.user.metadata.newObject = function (dataobj)
{
  try {
    var c = core;
    var log = c.log('ss.metadata.newObject');

    var db = c.metadata.db;
    db.source = dataobj['source'];
    db.permId = dataobj['permId'];
    // TODO need to parse this PHP unix timestamp to goog date object
    db.createDate = dataobj['createDate'];
    db.visitCounter = dataobj['visitCounter'];
    // now try to JSON decode the metadata
    try {
      db.metadata = JSON.parse(dataobj['metadata']);
    } catch(e) {
      db.metadata = null;
    }

    log.info('Parsed new metadataObject. source:' + db.source + ' permId:' + db.permId);

    // check if we have a valid perm id and track it in mixpanel
    if (0 != db.permId)
      c.analytics.identify(db.permId);

  } catch (e) {
    ss.error(e);
  }

};

/**
 * Return a root key from the metadata object
 *
 * If metadata is not valid or key doesn't exist
 * we return null
 *
 * @param {string} key the root key we want to get
 * @return {mixed} null if doesn't exit
 */
ss.user.metadata.get = function (key)
{
  try {
    var c = core;
    var db = c.metadata.db;

    if (null == db.metadata)
      return null;


    if (!goog.isDef(db.metadata[key]))
      return null;

    return db.metadata[key];

  } catch (e) {
    ss.error(e);
  }

};

/**
 * Will save a new value to the specified key
 *
 * We will also save on server
 *
 * We only save on the masterkey 'metadata' in our db
 *
 * @param {string} key The key
 * @param {mixed} value
 * @return {void}
 */
ss.user.metadata.save = function (key, value)
{
  try {
    var c = core, g = goog;

    var log = c.log('ss.metadata.save');

    log.info('Saving metadata. key:' + key + ' value:' + value);
    var db = c.metadata.db;

    // check if we have a null metadata object
    if (g.isNull(db.metadata))
      db.metadata = {};

    // save the new value
    db.metadata[key] = value;

    var aj = new c.ajax('/md/save', {
      postMethod: 'POST'
      , showMsg: false // don't show default success message
      , showErrorMsg: false // don't show error message if it happens
    });

    aj.addData('metadata', JSON.stringify(db.metadata));

    // ajax callback listener
    aj.callback = function (){};

    // ajax error listener
    aj.errorCallback = function (errorobj) {};

    // send ajax request
    aj.send();


  } catch (e) {
    ss.error(e);
  }

};


