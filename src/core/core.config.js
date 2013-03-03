/**
 * @fileOverview config keys used by the module
 */
goog.provide('ssd.core.config');

/** @const {string} The path to prepend to all the keys. */
ssd.core.config.PATH = 'user.auth';

/**
 * auth module configuration keys
 * @enum {string}
 */
ssd.core.config.Key = {

  // The status of any xhr operation an be cheched if these parameters
  // are defined. The master switch for the status checks on xhr responses
  // this this.
  STATUS_ENABLED: 'statusEnabled',

  // The key that will be used for reading the status from a JSON
  // response.
  STATUS_KEY: 'statusKey',

  // The value that represents a true result when strictly compared
  // to the value found in the defined key.
  STATUS_VALUATOR: 'statusValuator'
};

/**
 * Make the default value assignments
 * @type {Object}
 */
ssd.core.config.defaults = {};

(function() {
  var def = ssd.core.config.defaults;
  var key = ssd.core.config.Key;

  def[ key.STATUS_ENABLED ] = false;
  def[ key.STATUS_KEY ] = 'status';
  def[ key.STATUS_VALUATOR ] = 'true';
})();


