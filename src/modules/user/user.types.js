/**
 * @fileoverview definitions of user data structures.
 *
 */
goog.provide('ssd.user.types');

goog.require('ssd.structs.Map');

/**
 * @typedef {string} The plugin's name type, a single unique string
 *    for the external authentication service (e.g. Facebook).
 */
ssd.user.types.extSourceId;

/**
 * An array of external sources
 * @typedef {Array.<ssd.user.types.extSourceId>}
 */
ssd.user.types.extSources;

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
 *   sourceId: (ssd.user.types.extSourceId),
 *   userId: (number|string),
 *   profileUrl: (string),
 *   username: (string),
 *   profileImageUrl: (string)
 * }}
 */
ssd.user.types.extSource;



/**
 * A public user's data object
 *
 * @type {Object}
 */
ssd.user.types.user = {
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
  /** @type {ssd.structs.Map.<ssd.user.types.extSourceId>} */
  extSource: new ssd.structs.Map()
};

/**
 * An extension to ssd.user.types.user for the currently logged
 * in user's data object. Contains keys that are only available to
 * the owner of this data object
 * @type {Object}
 */
ssd.user.types.ownuser = {
  /** @type {string} */
  email: '',
  /** @type {boolean} */
  verified: false
};
