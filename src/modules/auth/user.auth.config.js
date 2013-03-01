/**
 * @fileOverview config keys used by the module
 */
goog.provide('ssd.user.auth.config');

/** @const {string} The path to prepend to all the keys. */
ssd.user.auth.config.PATH = 'user.auth';

/**
 * auth module configuration keys
 * @enum {string}
 */
ssd.user.auth.config.Key = {

  // The url for server authentication (login)
  // type: string
  AUTH_URL: 'authUrl',

  // Enable extenral authentication sources to verify with the local server
  // type: boolean
  EXT_SOURCES_TO_LOCAL: 'extSourcesLocal',

  // When an external auth source becomes authenticated
  // we use this URL to inform the server.
  //
  // Auth plugins can overwrite this parameter
  // type: string
  EXT_SOURCES_AUTH_URL: 'extAuthUrl',

  // The var name to use when (ajax) posting the SOURCEID to the server
  // type: string
  PARAM_SOURCE_ID: 'localSourceIdKey',

  // When performing a validation of an external source that has authed,
  // the ACCESS TOKEN has to be provided to the local server.
  // This is the name of the xhr key that will store the access token value.
  // type: string
  PARAM_ACCESS_TOKEN: 'localAccessTokenKey',

  // The key than contains the User Data Object from local server responses.
  // If set to null it is assumed that the whole response is the UDO.
  // type: string | null
  RESPONSE_KEY_UDO: 'udoKey',

  // Callback url
  // type: string
  TW_CALLBACK_URL: 'twCallbackUrl',

  //
  // Facebook only keys
  //

  // The app id key.
  // type: string
  FB_APP_ID: 'fbAppId',

  // Permissions to ask for.
  // type: string
  FB_PERMISSIONS: 'fbPerm',

  // Load facebook's API asynchronously and listen for load finish.
  // type: boolean
  FB_LOAD_API: 'fbLoadAPI'

};

/**
 * Make the default value assignments
 * @type {Object}
 */
ssd.user.auth.config.defaults = {};

(function() {
  var def = ssd.user.auth.config.defaults;
  var key = ssd.user.auth.config.Key;

  def[ key.AUTH_URL ] = '/auth/';
  def[ key.EXT_SOURCES_TO_LOCAL ] = false;
  def[ key.EXT_SOURCES_AUTH_URL ] = '/auth/';
  def[ key.PARAM_SOURCE_ID ] = 'sourceId';
  def[ key.PARAM_ACCESS_TOKEN ] = 'accessToken';
  def[ key.RESPONSE_KEY_UDO ] = null;
})();


