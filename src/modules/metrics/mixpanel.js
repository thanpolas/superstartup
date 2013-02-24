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
 * createdate 19/Nov/2010
 *
 *********
 *  File:: metrics/mixpanel.js 
 * Library for the mixpanel service
 *********
 */

goog.provide('ssd.metrics.mixpanel');

/**
 * Implements mixpanel's identify function for uniquely identifying
 * visitors.
 *
 * For now we track our visitors using the permanent Cook ID
 * Called from: ssd.metadata.newObject();
 *
 *
 * @param {Number} permId
 * @return {void}
 */
ssd.metrics.mixpanel.identify = function (permId)
{
    ssd.WEBTRACK && window['mpq']['identify'](permId);
};

/**
 * MixPanel implementation of event tracking
 *
 * @param {string} name
 * @param {object=} props custom properties
 * @return {void}
 */
ssd.metrics.mixpanel.track = function (name, props)
{
    if (!ssd.WEBTRACK)
        return;

    props = props || {};
    
    // patch for MP not showing the properties on the stream
    // views, we will use mp_note
    var mp_note = '';
    goog.object.forEach(props, function(val, index) {
      mp_note += index + ':' + val + ' / ';
    });
    props.mp_note = mp_note;
    window['mpq']['track'](name, props || {});
};

/**
 * Implementation of name_tag mixpanel featurs
 * 
 * @param {string} name
 * @return {void}
 */
ssd.metrics.mixpanel.nameTag = function(name)
{
  window['mpq']['name_tag'](name);
};

