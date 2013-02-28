/**
 * @fileoverview The auth plugin superclass.
 */
goog.provide('ssd.user.auth.PluginModule');

goog.require('ssd.Module');
goog.require('ssd.user.Auth');

/**
 * The basic auth plugin class
 *
 * @param {ssd.user.Auth} authInstance the auth module instance.
 * @constructor
 * @extends {ssd.Module}
 */
ssd.user.auth.PluginModule = function( authInstance )
{
  goog.base(this);
  /**
   * The user auth Class
   * @private
   * @type {ssd.user.Auth}
   */
  this._auth = authInstance;

  // set auth main as the parent event target
  this.setParentEventTarget( this._auth );

  /**
   * @private
   * @type {boolean} External source's Auth switch
   */
  this._isAuthed = false;

  /**
   * Used by our instance handlers to know if we have started
   * an auth crosscheck with local (server)
   * @type {boolean}
   */
  this.localAuthInit = false;


};
goog.inherits(ssd.user.auth.PluginModule, ssd.Module);

/**
 * Current user is authenticated with (ext auth source) service
 * @return {boolean}
 */
ssd.user.auth.PluginModule.prototype.isAuthed = function()
{
  return this._isAuthed;
};

/**
 * Mock the getAccessToken method. Overwrite if LOCALAUTH
 * is true
 *
 * @protected
 * @return {string} The oAuth access token
 */
ssd.user.auth.PluginModule.prototype.getAccessToken = function()
{
  return '';
};

