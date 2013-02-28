/**
 * @fileoverview The basic methods related to used authentication.
 * This class should never get instanciated, use the "controller" class
 * instead that extends this one: 'ssd.user.Auth'.
 */

goog.provide('ssd.user.AuthModel');

goog.require('goog.async.Deferred');

goog.require('ssd.user.auth.EventType');
goog.require('ssd.Module');
goog.require('ssd.ajax');
goog.require('ssd.ajax.Method');
goog.require('ssd.ajax');

/**
 * User authentication class
 *
 * @constructor
 * @extends {ssd.Module}
 */
ssd.user.AuthModel = function() {
  this.logger.info('Class instantiated');

  goog.base(this);
};
goog.inherits( ssd.user.AuthModel, ssd.Module);


/**
 * A logger to help debugging
 * @type {goog.debug.Logger}
 * @private
 */
ssd.user.AuthModel.prototype.logger = goog.debug.Logger.getLogger('ssd.user.AuthModel');

/**
 * Listener for external (FB, TW ...) initial auth event
 *
 * @private
 * @param {goog.events.Event} e
 */
ssd.user.AuthModel.prototype._initAuthStatus = function(e) {
  this.logger.info('_initAuthStatus() :: initial auth status dispatched From:' +
    e.target.SOURCEID + ' Source authed:' + e.target.isAuthed());

  // if not authed no need to go further
  if (!e.target.isAuthed()) {
    return;
  }

  // User is authed with that source. Save it to the map.
  this._extAuthedSources.set(e.target.SOURCEID, true);

  // check if this auth plugin requires authentication with the server
  if ( e.target.config( ssd.user.Auth.ConfigKeys.HAS_LOCAL_AUTH )) {
    this.verifyExtAuthWithLocal( e.target.SOURCEID );
  } else {
    this._doAuth( true );
  }

};

/**
 * Listener for external (FB, TW ...) initial auth event
 *
 * @private
 * @param {goog.events.Event} e
 */
ssd.user.AuthModel.prototype._authChange = function(e) {
  this.logger.info('_authChange() :: Auth CHANGE dispatched from:' +
    e.target.SOURCEID + ' Authed:' + e.target.isAuthed());

  // check if in our authed map
  var inAuthMap = this._extAuthedSources.get(e.target.SOURCEID);

  if (e.target.isAuthed()) {
    // If authed and we already have it in map then it's a double trigger, ignore
    if (inAuthMap) {
      this.logger.warning('_authChange() :: BOGUS situation. Received auth ' +
        'event but we already had a record of this source being authed. ' +
        'Double trigger');
      return;
    }

    this._extAuthedSources.set(e.target.SOURCEID, true);

    // check if this auth plugin requires authentication with the server
    if ( e.target.config( ssd.user.Auth.ConfigKeys.HAS_LOCAL_AUTH ) ) {
      this.verifyExtAuthWithLocal(e.target.SOURCEID);
    }

    // check if we were in a not authed state and change that
    if (!this._isAuthed && !this._hasLocalAuth) {
      this._doAuth(true);
    }
  } else {
    // got logged out from ext source
    if (!inAuthMap) {
      this.logger.warning('_authChange() :: BOGUS situation. ' +
        'Received de-auth event but had no record of being authed');
      return;
    }

    // remove from map
    this._extAuthedSources.remove(e.target.SOURCEID);

    // check if was last auth source left and we were authed
    if (0 === this._extAuthedSources.getCount() && this._isAuthed) {
      this._doAuth(false);
    }
  }
};

/**
 * When an external auth source changes state and becomes authenticated
 * we use this method to inform the server.
 *
 * The server will then determine if we are eligible to get authenticated
 * using that provider and if we are, an auth session is created.
 *
 * @protected
 * @param {ssd.user.types.extSourceId} sourceId
 * @return {goog.async.Deferred}
 */
ssd.user.AuthModel.prototype.verifyExtAuthWithLocal = function( sourceId ) {
  var def = new goog.async.Deferred();

  this.logger.info('_verifyExtAuthWithLocal() :: Init. LocalAuth Switch:' +
    this._hasLocalAuth + ' sourceId :' + sourceId );

  if (!this._hasLocalAuth) {
    def.errback();
    return def;
  }

  // get plugin instance
  var extInst = this._extSupportedSources.get( sourceId );

  //check if we have already started auth with server
  if ( extInst.localAuthInit ) {
    this.logger.warning('_verifyExtAuthWithLocal() :: Local auth has ' +
      'already started');
    def.errback();
    return def;
  }

  extInst.localAuthInit = true;

  // dispatch event and check for cancel...
  var eventObj = {
      type: ssd.user.auth.EventType.BEFORE_EXT_LOCAL_AUTH,
      'sourceId': sourceId
    };

  if (!this.dispatchEvent(eventObj)) {
    this.logger.info('_verifyExtAuthWithLocal() :: canceled due to ' +
      'event preventDefault');
    def.errback();
    return def;
  }

  //
  // Prepare the ajax call
  //
  // get local auth url from ext plugin or use default one.
  var url = extInst.config(ssd.user.Auth.ConfigKeys.LOCAL_AUTH_URL) ||
    this.config(ssd.user.Auth.ConfigKeys.LOCAL_AUTH_URL);

  var data = {},
      paramSource = this.config(ssd.user.Auth.ConfigKeys.PARAM_SOURCE_ID),
      paramAccessToken = this.config(ssd.user.Auth.ConfigKeys.PARAM_ACCESS_TOKEN);

  data[paramSource] = sourceId;
  data[paramAccessToken] = extInst.getAccessToken();

  var cb = goog.bind(function() {
    this._serverAuthResponse.apply(this, arguments)
      .chainDeferred( def );
  }, this);

  ssd.ajax.send( url, cb, ssd.ajax.Method.POST, data );

  return def;
};

/**
 * Callback method for AJAX requests that query the server for
 * the authentication state.
 *
 * This is the main entry point for any type of authentication
 * request to the local server (native or from a provider)
 *
 * In this method we determine if:
 *   1. The operation succeeded
 *   2. We received a positive or negative response from the server
 *
 * @param  {goog.events.Event} ev A goog event object.
 * @return {goog.async.Deferred} A deferred.
 * @private
 */
ssd.user.AuthModel.prototype._serverAuthResponse = function(ev) {
  var def = new goog.async.Deferred();

  this.logger.info('_serverAuthResponse() :: Init');

  /** @type {goog.net.XhrIo} */
  var xhr = ev.target,
      httpStatus = null,
      success = false,
      responseRaw = null,
      errorMessage = null;

  if ( xhr ) {
    httpStatus = xhr.getStatus();
    success = xhr.isSuccess();
    responseRaw = xhr.getResponse();
    errorMessage = xhr.getLastError();
  }

  var eventObj = {
    type: ssd.user.auth.EventType.ON_AUTH_RESPONSE,
    'responseRaw': responseRaw,
    'httpStatus': httpStatus,
    'success': success,
    'status': false,
    'errorMessage': errorMessage
  };

  // dispatch event and check if don't want exec.
  if ( false === this.dispatchEvent(eventObj) ) {
    this.logger.info('_serverAuthResponse() :: canceled due to ' +
      'event preventDefault');
    def.errback();
    return def;
  }

  // switch event type
  eventObj.type = ssd.user.auth.EventType.AFTER_AUTH_RESPONSE;

  // Check if ajax op was successful
  if ( !success ) {
    this.dispatchEvent(eventObj);
    def.errback();
    return def;
  }

  // try to parse the response
  var responseJson;
  /** @preserveTry */
  try {
    responseJson = xhr.getResponseAjax();
  } catch(ex) {
    eventObj['errorMessage'] = 'response not JSON';
    this.dispatchEvent(eventObj);
    def.errback();
    return def;
  }

  // get the statusObject
  var statusObject = ssd.helpers.getStatusObject(this.config);

  // check if we have status to check
  if (statusObject.hasStatus) {
    // yes we do... check the response
    if (statusObject.valuator !== responseJson[statusObject.status]) {
      // operation has failed...
      this.logger.warning('_serverAuthResponse() :: operation got a false response');
      eventObj['errorMessage'] = 'server said no dice';
      this.dispatchEvent(eventObj);
      def.errback();
      return def;
    }
  }

  // we had a successful operation, attempt to read the user data object
  var udo;
  /** @preserveTry */
  try {
    udo = responseJson[this.config(ssd.user.Auth.ConfigKeys.RESPONSE_KEY_UDO)];
  } catch(e){}


  if ( !this.auth(udo) ) {
    eventObj['errorMessage'] = 'user data object not valid';
    this.dispatchEvent(eventObj);
    def.errback();
    return def;
  }

  eventObj['response'] = udo;
  eventObj['status'] = true;
  this.dispatchEvent(eventObj);
  def.callback();
  return def;
};

/**
 * Perform authentication with the provided udo.
 *
 * @param  {Object} udo The User Data Object.
 * @return {boolean} If basic data structure validations fail.
 */
ssd.user.AuthModel.prototype.auth = function(udo) {
  this.logger.info('auth() :: Init.');

  // check the user data object is valid
  if (!this._dynmapUdo.validate(udo)) {
    this.logger.warning('auth() :: not a valid user data object');
    return false;
  }

  this._dynmapUdo.addAll(udo);

  this._doAuth( true );

  return true;
};

/**
 * de-authenticate current user.
 *
 */
ssd.user.AuthModel.prototype.deAuth = function() {
  this.logger.info('deAuth() :: Init.');
  this._doAuth( false );
};



/**
 * Perform an auth or deauth based on parameter
 *
 * @param {boolean} isAuthed
 * @private
 */
ssd.user.AuthModel.prototype._doAuth = function (isAuthed) {
  this.logger.info('_doAuth() :: Init. isAuthed:' + isAuthed);

  this._isAuthed = isAuthed;

  if ( !isAuthed ) {
    // clear the dynamic map data object
    this._dynmapUdo.clear();
  }
  var eventObj  = {
    'authState': this._isAuthed,
    type: ssd.user.auth.EventType.AUTH_CHANGE
  };
  this.dispatchEvent(eventObj);
};

/**
 * If current user is authenticated
 *
 * @return {boolean}
 */
ssd.user.AuthModel.prototype.isAuthed = function() {
    return this._isAuthed;
};

/**
 * If current user is authenticated with specified external
 * auth source
 *
 * @param {ssd.user.types.extSourceId} sourceId
 * @return {boolean}
 */
ssd.user.AuthModel.prototype.isExtAuthed = function(sourceId) {
  return this._extAuthedSources.get(sourceId) || false;
};

/**
 * Tells us if user is verified
 *
 * @return {boolean}
 */
ssd.user.AuthModel.prototype.isVerified = function() {
  return this._isAuthed && this._dynmapUdo.get(ssd.conf.user.typeMappings.ownuser.verified);
};

/**
 * Logout from all auth sources, clear data objects
 * and dispose everything
 * @return {void}
 */
ssd.user.AuthModel.prototype.logout = function() {

  // we used goog.mixin() to do multiple inheritance for
  // events, thus we have to directly call event's disposeInternal
  goog.events.EventTarget.disposeInternal.call(this._dynmapUdo);

  this._doAuth(false);
};


