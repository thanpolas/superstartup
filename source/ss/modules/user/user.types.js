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
 * createdate 06/Jun/2012
 *
 *********
 */

/**
 * @fileoverview definitions of user data structures
 */

goog.provide('ss.user.types');

goog.require('ss.Map');

/**
 * @typedef {string} The plugin's name type, a single unique string
 *    for the external authentication service (e.g. Facebook)
 */
ss.user.types.extSourceId;

/**
 * An array of external sources
 * @typedef {Array.<ss.user.types.extSourceId>}
 */
ss.user.types.extSources;

/**
 * An external authentication user data object.
 * Persistently stored information about known authed ext sources
 * of the user
 * - sourceId: The source type of the ext auth (Facebook, Twitter, etc)
 * - userId: The user id as provided by the ext auth source
 * - profileUrl: The url pointing to the user's profile on the ext auth source
 * - username: Username used in external source
 * - profileImageUrl: Default profile photo of user from ext auth source
 *
 * @typedef {{
 *   sourceId: (ss.user.types.extSourceId),
 *   userId: (number|string),
 *   profileUrl: (string),
 *   username: (string),
 *   profileImageUrl: (string)
 * }}
 */
ss.user.types.extSource;



/**
 * A public user's data object
 *
 * @type {Object}
 */
ss.user.types.user = {
  /** @type {string} */
  id: '0',
  /** @type {string} */
  username: '',
  /** @type {string} */
  firstName: '',
  /** @type {string} */
  lastName: '',
  /** @type {string} */
  fullName: '',
  /** @type {number} Unix timestamp */
  createDate: 0,
  /** @type {boolean} If user has external authentication sources */
  hasExtSource: false,
  /** @type {ss.Map.<ss.user.types.extSourceId>} */
  extSource: new ss.Map()
};

/**
 * An extension to ss.user.types.user for the currently logged
 * in user's data object. Contains keys that are only available to 
 * the owner of this data object
 * @type {Object}
 */
ss.user.types.ownuser = {
  /** @type {string} */
  email: '',
  /** @type {boolean} */
  verified: false
};
