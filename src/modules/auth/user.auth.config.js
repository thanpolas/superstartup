/**
 * @fileoverview config keys used by the module
 */
goog.provide('ssd.user.auth.config');

/** @const {string} The path to prepend to all the keys. */
ssd.user.auth.config.PATH = 'user';

/**
 * auth module configuration keys
 * @enum {string}
 */
ssd.user.auth.config.Key = {

  // if authentication with local server is enabled
  // or we are only on the air
  // type: boolean
  HAS_LOCAL_AUTH: 'hasLocalAuth',

  // The url for server authentication (login)
  // type: string
  LOGIN_URL: 'loginUrl',

  // the logout url
  // type: string
  LOGOUT_URL: 'logoutUrl',

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

  //
  // Define if the authentication response is JSON
  //
  RESPONSE_AUTH_JSON: 'resAuthJson',

  //
  //
  // Facebook only keys
  //
  //

  // The app id key.
  // type: string
  FB_APP_ID: 'appId',

  // Permissions to ask for.
  // type: string
  FB_PERMISSIONS: 'perm',

  // Load facebook's API asynchronously and listen for load finish.
  // type: boolean
  FB_LOAD_API: 'loadAPI',

  //
  //
  // Twitter only keys
  //
  //

  // Callback name used as a GET param durint the login operation.
  // It is meant to be read by the backend server so it knows where
  // to redirect a client after a login op.
  // If not set, there is no default, the param will not be used.
  // type: ?string
  TW_CALLBACK_PARAM: 'callbackUrl',

  // Login timeout in ms
  // type: number
  LOGIN_TIMEOUT: 'loginTimeout',

  // Enable login using a new popup window
  // type: boolean
  TW_LOGIN_POPUP: 'loginPopup',

  // Popup window width
  // type: number
  LOGIN_POPUP_WIDTH: 'loginPopupWidth',

  // Popup window height
  // type: number
  LOGIN_POPUP_HEIGHT: 'loginPopupHeight'

};

/**
 * Make the default value assignments
 * @type {Object}
 */
ssd.user.auth.config.defaults = {};

(function() {
  var def = ssd.user.auth.config.defaults;
  var key = ssd.user.auth.config.Key;

  def[ key.HAS_LOCAL_AUTH ] = true;
  def[ key.LOGIN_URL ] = '/user/login';
  def[ key.LOGOUT_URL ] = '/user/logout';
  def[ key.EXT_SOURCES_TO_LOCAL ] = false;
  def[ key.EXT_SOURCES_AUTH_URL ] = '/auth/';
  def[ key.PARAM_SOURCE_ID ] = 'sourceId';
  def[ key.PARAM_ACCESS_TOKEN ] = 'accessToken';
  def[ key.RESPONSE_KEY_UDO ] = null;
  def[ key.RESPONSE_AUTH_JSON] = true;
})();


