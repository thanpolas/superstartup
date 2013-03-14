/**
 * @fileoverview The twitter auth functionality
 *
 */
goog.provide('ssd.user.auth.Twitter');
goog.provide('ssd.user.auth.twitter.EventType');
goog.provide('ssd.user.auth.twitter.LoginOp');

goog.require('ssd.user.auth.PluginModule');
goog.require('ssd.user.auth.config');
goog.require('ssd.user.Auth');
goog.require('ssd.user.auth.EventType');

/**
 * The Twitter auth constructor
 *
 * @param {Function} authInst the auth module capsule.
 * @implements {ssd.user.auth.PluginInterface}
 * @extends {ssd.user.auth.PluginModule}
 */
ssd.user.auth.Twitter = function( authInst ) {
  this.logger.info('ctor() :: Init.');
  goog.base(this, authInst);

  /** @type {?ssd.Config} */
  this.config = authInst.config.prependPath(
    ssd.user.auth.Twitter.CONFIG_PATH );

  /**
   * @type {ssd.user.auth.twitter.LoginOp}
   * @private
   */
  this._loginOp = null;

  // set if a local auth with the server should be performed when this
  // plugin authenticates.
  this.config(ssd.user.auth.config.Key.EXT_SOURCES_TO_LOCAL, false);

  // Default endpoint for twitter auth
  this.config(ssd.user.auth.config.Key.EXT_SOURCES_AUTH_URL,
    '/auth/twitter');

  // Default login timeout: 12s
  this.config(ssd.user.auth.config.Key.LOGIN_TIMEOUT, 12000);


  // login callback param
  this.config(ssd.user.auth.config.Key.TW_CALLBACK_PARAM, null);

  // login using popup
  this.config(ssd.user.auth.config.Key.TW_LOGIN_POPUP, false);

  // login popup width
  this.config(ssd.user.auth.config.Key.LOGIN_POPUP_WIDTH, 1015);
  // login popup height
  this.config(ssd.user.auth.config.Key.LOGIN_POPUP_HEIGHT, 500);

  /** @inheritDoc */
  this._hasJSAPI = false;

  // register ourselves to main external auth class
  this._auth.addExtSource(this);
};
goog.inherits(ssd.user.auth.Twitter, ssd.user.auth.PluginModule);
goog.addSingletonGetter(ssd.user.auth.Twitter);

/**
 * String path that we'll store the config
 * @const {string}
 */
ssd.user.auth.Twitter.CONFIG_PATH = 'tw';

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
 * @return {when.Promise}
 */
ssd.user.auth.Twitter.prototype.init = function() {
  var def = when.defer();

  this.logger.info('init() :: Dispatching dummy event');

  this.dispatchEvent( ssd.user.auth.EventType.INITIAL_EXT_AUTH_STATE );

  // resolve the deferred and pass current auth status.
  return def.resolve( false );
};

/**
 * Opens the login dialog or starts the authentication flow
 *
 * @param  {Function(boolean)=} optCallback optional callback
 * @param {} [varname] [description]
 * @return {when.Promise}
 */
ssd.user.auth.Twitter.prototype.login = function(optCallback, optSelf) {

  this.logger.info('login() :: Init.');

  var def = when.defer();
  var callback = optCallback || ssd.noop;

  def.promise.then(
    goog.bind(this._promise2cb, this, callback, optSelf, true),
    goog.bind(this._promise2cb, this, callback, optSelf, false)
  );

  if ( !this._beforeLogin() ) {
    return def.reject('canceled by event');
  }

  if (this.config(ssd.user.auth.config.Key.TW_LOGIN_POPUP)) {
    this.loginPopup().then(def.resolve, def.reject);
  } else {
    this.loginRedirect();
  }

  return def.promise;
};

/**
 * Perform a login by redirecting the user... execution stops here.
 *
 */
ssd.user.auth.Twitter.prototype.loginRedirect = function() {
  // use the current path of the user for return
  var callbackParam = this.config(ssd.user.auth.config.Key.TW_CALLBACK_PARAM);

  var returnPath = '';
  if (goog.isString(callbackParam)) {
    returnPath = '?' + callbackParam +
      '=' + ssd.encURI(window.location.pathname);
  }

  this.logger.info('Init loginRedirect(). Return path: ' + returnPath);

  // redirect the browser
  window.location.href = this.config( ssd.user.auth.config.Keys
    .EXT_SOURCES_AUTH_URL ) + returnPath;
};

/**
 * Convert a promise outcome into a callback.
 *
 * On error the callback expects:
 * 1. string : error message
 * 2. boolean : authState
 *
 * On Success of operation callback expects:
 * 1. null : error message null
 * 2. boolean : authState
 * 3. Object : udo
 * 4. Object|string= : Server response raw
 * 5. Object|string= : Third Party response raw
 *
 * @param  {!Function} cb a function.
 * @param  {Object|undefined} self scope.
 * @param  {boolean} status operation status.
 * @param  {[type]}   optRespObj [description]
 * @param  {ssd.user.auth.plugin.Response|string=} optRespObj response object or
 *   error message.
 * @private
 */
ssd.user.auth.Twitter.prototype._promise2cb = function(cb, self, status,
  optRespObj) {

  this.logger.finer('_promise2cb() :: Init. Status:' + status);
  var respObj = optRespObj || {};

  if (!status) {
    cb.call(self, respObj, this._auth.isAuthed());
    return;
  }
  cb.call(self,
    null,
    this._auth.isAuthed(),
    this._auth.getSet(),
    respObj.serverRaw,
    respObj.responsePluginRaw
  );
};


/**
 * Perform a login using a popup
 *
 * @return {when.Promise} a promise.
 */
ssd.user.auth.Twitter.prototype.loginPopup = function() {
  this.logger.info('_loginPopup() :: Init.');
  var def = when.defer();

  var url = this.config(ssd.user.auth.config.Key.EXT_SOURCES_AUTH_URL);

  var width = this.config(ssd.user.auth.config.Key.LOGIN_POPUP_WIDTH);
  var height = this.config(ssd.user.auth.config.Key.LOGIN_POPUP_HEIGHT);

  var opTimeout = this.config(ssd.user.auth.config.Key.LOGIN_TIMEOUT);

  if (this._loginOp && this._loginOp.running) {
    this._loginOp.reject();
  }
  this._loginOp = new ssd.user.auth.twitter.LoginOp({
    def: def, timeout: opTimeout
  });

  window.open(url, 'popup', 'width=' + width + ',height=' + height);

  return def.promise;
};

/**
 * This method is called from the popup window after a login operation.
 *
 * @param {string} token The access token.
 */
ssd.user.auth.Twitter.prototype.oauthToken = function(token) {
  this.logger.info('oauthToken() :: Init.');

  this._accessToken = token;

  var respObj = this._getRespObj();
  respObj.authStatePlugin = this.isAuthed();
  respObj.accessToken = token;
  respObj.responsePluginRaw = token;

  var eventObj = respObj.event(ssd.user.auth.EventType.ON_EXT_OAUTH, this);

  if (false === this.dispatchEvent( eventObj )) {
    this._accessToken = null;
    if (this._loginOp.running) {
      this._loginOp.reject('canceled by on oauth event');
    }
    return;
  }

  if (!this._loginOp.running) {
    this.logger.severe('oauthToken() :: There is no login operation running!');
    // nothing to do
    return;
  }

  // perform auth
  this._doAuth(true, respObj)
    .then(goog.bind(this._loginOp.resolve, this._loginOp),
      goog.bind(this._loginOp.reject, this._loginOp));

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
 *
 * @param  {Function=} optCb Callback.
 * @param  {Object} optSelf scope for cb.
 * @return {when.Promise} null if not authed.
 */
ssd.user.auth.Twitter.prototype.getUser = function(optCb, optSelf) {
  var def = when.defer();

  var cb = optCb || ssd.noop;

  def.promise.then(goog.bind(cb, optSelf), goog.bind(cb, optSelf));

  if ( !this.isAuthed() ) {
    return def.resolve(null);
  }

  // FIXME
  def.resolve({});

  return def.promise;
};


/**
 * A login operation object.
 *
 * @param {Object} params [description]
 * @constructor
 */
ssd.user.auth.twitter.LoginOp = function(params) {

  /**
   * @type {when.Deferred}
   */
  this.def = params.def;

  /**
   * @type {boolean} if a login operation is running.
   */
  this.running = true;

  this._timeoutIndex = setTimeout(
    goog.bind(this.reject, this, 'Operation timeout'),
    params.timeout
  );

};

/**
 * Will reject the login operation.
 *
 * @param  {string=} optErrMsg Define a message for rejecting the deferred.
 */
ssd.user.auth.twitter.LoginOp.prototype.reject = function(optErrMsg) {
  if (!this.running) {
    return;
  }
  var errMsg = optErrMsg || 'Canceled by new login';
  this.running = false;
  clearTimeout(this._timeoutIndex);
  this._timeoutIndex = null;
  this.def.reject(errMsg);
};


/**
 * Will resolve the login operation.
 *
 * @param  {ssd.user.auth.plugin.Response} respObj The response object.
 */
ssd.user.auth.twitter.LoginOp.prototype.resolve = function(respObj) {
  if (!this.running) {
    return;
  }
  this.running = false;
  clearTimeout(this._timeoutIndex);
  this._timeoutIndex = null;
  this.def.resolve(respObj);
};
