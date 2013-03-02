/**
 * @fileOverview responsible for the login / logout operations.
 */
goog.provide('ssd.user.AuthLogin');

goog.require('goog.dom');
goog.require('goog.dom.forms');
goog.require('goog.async.Deferred');


goog.require('ssd.user.AuthModel');

goog.require('ssd.user.auth.EventType');
goog.require('ssd.user.auth.config');
goog.require('ssd.ajax');
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
 * @return {goog.async.Deferred} A promise.
 * @throws {TypeError} If argument not of expected types.
 */
ssd.user.AuthLogin.prototype.login = function( arg1, optCB, optSelfObj ) {
  this.logger.info('login() :: Init.');

  var def = new goog.async.Deferred();
  var cb = optCB || ssd.noop;

  def.addCallback(function( optUdo, optResponse ) {
    cb.call(optSelfObj, null, this.isAuthed(), optUdo, optResponse);
  }, this);
  def.addErrback(function( errMsg ) {
    cb.call(optSelfObj, errMsg, this.isAuthed() );
  }, this);

  if (goog.dom.isElement(arg1)) {
    return this._loginElement( arg1 ).chainDeferred( def );
  }

  if (ssd.isjQ(arg1)) {
    return this._loginjQuery( arg1 ).chainDeferred( def );
  }

  if (goog.isObject(arg1)) {
    return this._loginStart( arg1 ).chainDeferred( def );
  }

  throw new TypeError('auth.login argument not Object or Element or jQuery');
};

/**
 * Scan the element's childs for input fields and create the login object
 * to pass to the server.
 *
 * @param  {Element} el [description]
 * @return {goog.async.Deferred} A promise.
 */
ssd.user.AuthLogin.prototype._loginElement = function( el ) {
  this.logger.info('_loginElement() :: Init.');

  var def = new goog.async.Deferred();

  /** @type {goog.structs.Map} */
  var paramsMap;
  /** @preserveTry */
  try {
    paramsMap = goog.dom.forms.getFormDataMap( el );
  } catch (ex) {
    def.errback('not a form element');
    return def;
  }

  if ( 0 === paramsMap.getCount()) {
    def.errback('no form data');
    return def;
  }

  return this._loginStart( paramsMap.toObject() );

};


/**
 * Scan the jQuery form's childs for input fields and create the login object
 * to pass to the server.
 *
 * @param  {jQuery} $el jQuery object.
 * @return {goog.async.Deferred} A promise.
 */
ssd.user.AuthLogin.prototype._loginjQuery = function( $el ) {
  this.logger.info('_loginjQuery() :: Init.');

  return this._loginElement( $el[0] );
};


/**
 * The data object is ready, prep and perform server query.
 *
 * @param  {Object} data The data object with credentials.
 * @return {goog.async.Deferred} a promise.
 */
ssd.user.AuthLogin.prototype._loginStart = function( data ) {
  this.logger.info('_loginStart() :: Init.');

  var url = this.config(ssd.user.auth.config.Key.AUTH_URL);

  console.log(url);
  return this.performLocalAuth( url, data );
};

