/**
 * @fileOverview config keys used by the module
 */
goog.provide('ssd.user.auth.ConfigKeys');


/**
 * auth module configuration keys
 * @enum {string}
 */
ssd.user.auth.ConfigKeys = {
  /**
   * String path that we'll store the config
   */
  CONFIG_PATH: 'user.auth',

  /** The config key that declares if a plugin needs local auth */
  HAS_LOCAL_AUTH: 'user.auth',

  LOCAL_AUTH_URL: 'localAuthUrl',

  // The var name to use when (ajax) posting the SOURCEID to the server
  // depends on 'performLocalAuth'
  PARAM_SOURCE_ID: 'localAuthSourceId',
  PARAM_ACCESS_TOKEN: 'localAuthAccessToken',

  // the udo response keys
  RESPONSE_KEY_UDO: 'udoKey'
};


