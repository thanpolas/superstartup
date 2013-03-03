/**
 * @fileoverview The twitter auth functionality
 *
 */
goog.provide('ssd.user.auth.Twitter');
goog.provide('ssd.user.auth.Twitter.EventType');

goog.require('goog.async.Deferred');

goog.require('ssd.user.auth.PluginModule');
goog.require('ssd.user.auth.config');
goog.require('ssd.user.Auth');
goog.require('ssd.user.auth.EventType');
goog.require('ssd.register');

/**
 * The Twitter auth constructor
 *
 * @param {Function} authCapsule the auth module capsule.
 * @implements {ssd.user.auth.PluginInterface}
 * @extends {ssd.user.auth.PluginModule}
 */
ssd.user.auth.Twitter = function( authCapsule )
{
  goog.base(this, authCapsule);

  /** @type {ssd.Config} */
  this.config = authCapsule._instance.config.prependPath(
    ssd.user.auth.Twitter.CONFIG_PATH );

  // set if a local auth with the server should be performed when this
  // plugin authenticates.
  this.config(ssd.user.auth.config.Key.EXT_SOURCES_TO_LOCAL, false);

  this.config(ssd.user.auth.config.Key.EXT_SOURCES_AUTH_URL,
    '/auth/twitter');

  this.config(ssd.user.auth.config.Key.TW_CALLBACK_URL, 'url');

  // register ourselves to main external auth class
  this._auth.addExtSource(this);
};
goog.inherits(ssd.user.auth.Twitter, ssd.user.auth.PluginModule);
goog.addSingletonGetter(ssd.user.auth.Twitter);

/**
 * String path that we'll store the config
 * @const {string}
 */
ssd.user.auth.Twitter.CONFIG_PATH = 'twitter';

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

  this.logger.info('init() :: Dispatching dummy event');

  this.dispatchEvent( ssd.user.auth.EventType.INITIAL_EXT_AUTH_STATE );
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
  var returnPath = '?' + this.config(ssd.user.auth.config.Key.TW_CALLBACK_URL) +
    '=' + ssd.encURI(window.location.pathname);

  this.logger.info('Init login(). Return path:' + returnPath);

  // we have to redirect user to /signup/twitter.php
  // to start the authentication process

  // redirect the browser now
  window.location.href = this.config( ssd.user.auth.config.Keys
    .EXT_SOURCES_AUTH_URL ) + returnPath;
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
ssd.user.auth.Twitter.onPluginRun = function( authCapsule ) {
  // twitter auth plugin
  authCapsule['tw'] = new ssd.user.auth.Twitter( authCapsule );
};
ssd.register.plugin( ssd.user.Auth.MODULE_NAME,
  ssd.user.auth.Twitter.onPluginRun );


