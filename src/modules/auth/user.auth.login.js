/**
 * @fileOverview responsible for the login / logout operations.
 */
goog.provide('ssd.user.AuthLogin');

goog.require('goog.dom');
goog.require('goog.dom.forms');

goog.require('ssd.user.AuthModel');

goog.require('ssd.user.auth.EventType');
goog.require('ssd.user.auth.config');
goog.require('ssd.sync');
goog.require('ssd.helpers');

/**
 * User authentication class
 *
 * @constructor
 * @extends {ssd.user.AuthModel}
 */
ssd.user.AuthLogin = function() {
  goog.base(this);
};
goog.inherits( ssd.user.AuthLogin, ssd.user.AuthModel);

/**
 * Perform a login operation.
 *
 * Login implies that credentials are provided and need to be verified with
 * an authoritative source, most likely the server.
 *
 *
 *
 * @param  {Object|jQuery|Element} arg1 One of the three defined types.
 * @param {function(string|null, boolean, Object=, Object=)=} optCB optionally
 *   define a callback, the full sig of the callback is:
 *   cb(err, authState, udo, response).
 * @param {Object} optSelfObj Object context to use for optCB.
 * @return {when.Promise} A promise.
 * @throws {TypeError} If argument not of expected types.
 */
ssd.user.AuthLogin.prototype.login = function( arg1, optCB, optSelfObj ) {
  this.logger.info('login() :: Init.');

  var def = when.defer();
  var cb = optCB || ssd.noop;

  def.promise.then(goog.bind(function( statusObj ) {
    if (false === statusObj) {
      cb.call(optSelfObj, null, false);
    }

    cb.call(optSelfObj, null, statusObj['authState'], statusObj['udo'],
      statusObj['response']);

  }, this));

  def.promise.otherwise(goog.bind(function( errMsg ) {
    cb.call(optSelfObj, errMsg, this.isAuthed() );
  }, this));

  if (goog.dom.isElement(arg1)) {
    return when.chain( this._loginElement( arg1 ), def.resolver );
  }

  if (ssd.isjQ(arg1)) {
    return when.chain( this._loginjQuery( arg1 ), def.resolver );
  }

  if (goog.isObject(arg1)) {
    return when.chain( this._loginStart( arg1 ), def.resolver );
  }

  throw new TypeError('auth.login argument not Object or Element or jQuery');
};

/**
 * Scan the element's childs for input fields and create the login object
 * to pass to the server.
 *
 * @param  {Element} el [description]
 * @return {when.Promise} A promise.
 */
ssd.user.AuthLogin.prototype._loginElement = function( el ) {
  this.logger.info('_loginElement() :: Init.');

  var def = when.defer();

  /** @type {goog.structs.Map} */
  var paramsMap, params;

  /** @preserveTry */
  try {
    paramsMap = goog.dom.forms.getFormDataMap( el );
    params = goog.object.map(paramsMap.toObject(), function(value) {
      return value[0];
    });
  } catch (ex) {
    return def.reject('not a form element');
  }

  if ( 0 === paramsMap.getCount()) {
    return def.reject('no form data');
  }

  return this._loginStart( params );
};

/**
 * Scan the jQuery form's childs for input fields and create the login object
 * to pass to the server.
 *
 * @param  {jQuery} $el jQuery object.
 * @return {when.Promise} A promise.
 */
ssd.user.AuthLogin.prototype._loginjQuery = function( $el ) {
  this.logger.info('_loginjQuery() :: Init.');

  return this._loginElement( $el[0] );
};


/**
 * The data object is ready, prep and perform server query.
 *
 * @param  {Object} data The data object with credentials.
 * @return {when.Promise} a promise.
 */
ssd.user.AuthLogin.prototype._loginStart = function( data ) {
  this.logger.info('_loginStart() :: Init.');

  var url = this.config(ssd.user.auth.config.Key.LOGIN_URL);

  return this.performLocalAuth( url, data );
};


/**
 * Logout from all auth sources.
 *
 * @param {function(boolean)=} optCb callback with the status as parameter (xhr op).
 * @param  {Object=} optSelfObj self object to invoke the cb on.
 * @return {when.Promise}
 */
ssd.user.AuthLogin.prototype.logout = function(optCb, optSelfObj) {
  this.logger.info('logout() :: init');
  var def = when.defer();

  var cb = optCb || ssd.noop;

  def.promise.then( goog.bind( function( respObj ) {
    cb.call(optSelfObj, null, respObj.success );
  }, this ));
  def.promise.otherwise( goog.bind( function( errMsg ) {
    cb.call(optSelfObj, errMsg, false );
  }, this));


  // check if local auth enabled
  if (! this.config( ssd.user.auth.config.Key.HAS_LOCAL_AUTH )) {
    this.logger.info('logout() :: local auth is disabled');
    this._doAuth(false);
    return def.resolve(true);
  }

  if (!this.dispatchEvent(ssd.user.auth.EventType.BEFORE_LOGOUT)) {
    this.logger.info('login() :: Canceled by event');
    return def.resolve(true);
  }

  // perform deauthentication
  this._doAuth(false);

  var logoutUrl = this.config(ssd.user.auth.config.Key.LOGOUT_URL);

  ssd.sync.send( logoutUrl, null, ssd.ajax.Method.POST )
    .then( goog.bind(this._logoutResponse, this), def.reject )
    .then( def.resolve, def.reject );

  return def.promise;
};


/**
 * XHR Response for logout
 *
 * @param  {ssd.sync.ResponseObject} response The response object.
 * @private
 * @return {when.Promise} a Promise.
 */
ssd.user.AuthLogin.prototype._logoutResponse = function( response ) {
  this.logger.info('_logoutResponse() :: Init.');

  var def = when.defer();

  var respObj = new ssd.user.auth.Response(response);
  var eventObj = respObj.event(ssd.user.auth.EventType.ON_LOGOUT_RESPONSE, this);

  // dispatch event and check if don't want exec.
  if ( false === this.dispatchEvent(eventObj) ) {
    this.logger.info('_logoutResponse() :: canceled due to ' +
      'event preventDefault');
    return def.resolve(respObj);
  }

  // switch event type
  eventObj.type = ssd.user.auth.EventType.AFTER_LOGOUT_RESPONSE;
  this.dispatchEvent(eventObj);
  return def.resolve(respObj);
};

