/**
 * @fileoverview The twitter auth functionality
 *
 */
goog.provide('ssd.user.auth.Twitter');
goog.provide('ssd.user.auth.Twitter.EventType');

goog.require('goog.async.Deferred');

goog.require('ssd.user.auth.PluginModule');
goog.require('ssd.user.Auth');
goog.require('ssd.user.auth.EventType');
goog.require('ssd.register');

/**
 * The Twitter auth constructor
 *
 * @constructor
 * @implements {ssd.user.auth.PluginInterface}
 * @extends {ssd.user.auth.PluginModule}
 */
ssd.user.auth.Twitter = function()
{
  goog.base(this);

  /** @type {ssd.Config} */
  this.config = this._config.prependPath( ssd.user.auth.Twitter.CONFIG_PATH );

  // set if a local auth with the server should be performed when this
  // plugin authenticates.
  this.config(ssd.user.Auth.ConfigKeys.HAS_LOCAL_AUTH, false);

  this.config('authUrl', '/users/twitter');

  // name of GET param to use when redirecting for twitter
  // oAuth login, which will contain the current url so
  // we know where to redirect the user once he/she comes
  // back from Twitter
  this.config('returnPathParam', 'url');

  // register ourselves to main external auth class
  this._auth.addExtSource(this);
};
goog.inherits(ssd.user.auth.Twitter, ssd.user.auth.PluginModule);
goog.addSingletonGetter(ssd.user.auth.Twitter);

/**
 * String path that we'll store the config
 * @const {string}
 */
ssd.user.auth.Twitter.CONFIG_PATH = 'user.auth.twitter';

/**
 * A logger to help debugging
 * @type {goog.debug.Logger}
 * @private
 */
ssd.user.auth.Twitter.prototype.logger =  goog.debug.Logger.getLogger('ssd.user.auth.Twitter');

/**
 * @const {ssd.user.types.extSourceId} The plugin's name (e.g. Twitter)
 */
ssd.user.auth.Twitter.prototype.SOURCEID = 'twitter';

/**
 * Start initial authentication checks
 * When a definitive result is produced, dispatch the INITIAL_AUTH_STATUS
 * event
 *
 * @return {goog.async.Deferred}
 */
ssd.user.auth.Twitter.prototype.init = function() {
  var def = new goog.async.Deferred();

  this.logger.info('Init init(). Dispatching dummy event');

  this.dispatchEvent( ssd.user.auth.EventType.INITIAL_AUTH_STATUS );
  // resolve the deferred and pass current auth status.
  def.callback( false );

  return def;
};

/**
 * Opens the login dialog or starts the authentication flow
 *
 * @param  {Function(boolean)=} optCallback optional callback
 * @param {string=} optPerms set permissions if we need to...
 *      comma separate them
 * @return {void}
 */
ssd.user.auth.Twitter.prototype.login = function(optCallback, optPerms) {
  // use the current path of the user for return
  var returnPath = '?' + this.config('returnPathParam') + '=' +
    ssd.encURI(window.location.pathname);

  this.logger.info('Init login(). Return path:' + returnPath);

  // we have to redirect user to /signup/twitter.php
  // to start the authentication process

  // redirect the browser now
  window.location.href = this.config('loginUrl') + returnPath;
};

/**
 * Twitter Login Listener.
 * We listen for the completion of the fb login modal
 *
 * @private
 * @param {object} response
 * @param {Function(boolean)} callback
 * @return {void}
 */
ssd.user.auth.Twitter.prototype._loginListener = function (response, callback)
{
  this.logger.info('Init _loginListener()');

  callback(this._isAuthedFromResponse(response));
};

/**
* Perform a logout action
*
* @return {void}
*/
ssd.user.auth.Twitter.prototype.logout = function()
{
  this.logger.info('Init logout()');
  this._isAuthed = false;
  this.dispatchEvent(ssd.user.auth.EventType.EXT_AUTH_CHANGE);
};

/**
 * If user is authed returns us a {@link ssd.user.types.extSource}
 * data object
 * @return {ssd.user.types.extSource|null} null if not authed
 */
ssd.user.auth.Twitter.prototype.getUser = function()
{

};

/**
 * Register to auth module.
 *
 */
ssd.user.auth.Twitter.onPluginRun = function( ) {
  // twitter auth plugin
  ssd.user.auth.Twitter.getInstance();
};
ssd.register.plugin( ssd.user.Auth.MODULE_NAME,
  ssd.user.auth.Twitter.onPluginRun );


