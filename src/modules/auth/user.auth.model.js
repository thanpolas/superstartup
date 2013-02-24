/**
 * @fileoverview The basic methods related to used authentication.
 * This class should never get instanciated, use the "controller" class
 * instead that extends this one: 'ssd.user.Auth'.
 */

goog.provide('ssd.user.AuthModel');

goog.require('ssd.Module');

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
  this.logger.info('_initAuthStatus() :: initial auth status dispatched From:' + e.target.SOURCEID + ' Source authed:' + e.target.isAuthed() + ' plugin has LocalAuth:' + e.target.LOCALAUTH);

  // if not authed no need to go further
  if (!e.target.isAuthed()) {
    return;
  }

  // we are authed with that source! Save it to our map
  this._extAuthedSources.set(e.target.SOURCEID, true);

  // check if this auth plugin requires authentication with our server
  if (e.target.LOCALAUTH) {
    this.verifyExtAuthWithLocal(e.target.SOURCEID);
  }

  // check if we were in a not authed state and change that
  if (!this._isAuthed && !this._hasLocalAuth) {
    this._doAuth(true);
  }
};

/**
 * Listener for external (FB, TW ...) initial auth event
 *
 * @private
 * @param {goog.events.Event} e
 */
ssd.user.AuthModel.prototype._authChange = function(e) {
  this.logger.info('_authChange() :: Auth CHANGE dispatched from:' + e.target.SOURCEID + ' Authed:' + e.target.isAuthed());

  // check if in our authed map
  var inAuthMap = this._extAuthedSources.get(e.target.SOURCEID);

  if (e.target.isAuthed()) {
    // If authed and we already have it in map then it's a double trigger, ignore
    if (inAuthMap) {
      this.logger.warning('_authChange() :: BOGUS situation. Received auth event but we already had a record of this source being authed. Double trigger');
      return;
    }

    this._extAuthedSources.set(e.target.SOURCEID, true);

    // check if this auth plugin requires authentication with our server
    if (e.target.LOCALAUTH) {
      this.verifyExtAuthWithLocal(e.target.SOURCEID);
    }

    // check if we were in a not authed state and change that
    if (!this._isAuthed && !this._hasLocalAuth) {
      this._doAuth(true);
    }
  } else {
    // got logged out from ext source
    if (!inAuthMap) {
      this.logger.warning('_authChange() :: BOGUS situation. Received de-auth event but had no record of being authed');
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
 * @return {void}
 */
ssd.user.AuthModel.prototype.verifyExtAuthWithLocal = function (sourceId) {
  this.logger.info('_verifyExtAuthWithLocal() :: Init. LocalAuth Switch:' + this._hasLocalAuth + ' sourceId :' + sourceId );

  if (!this._hasLocalAuth) {
    return;
  }

  // get plugin instance
  var extInst = this._extSupportedSources.get(sourceId);

  this.logger.info('_verifyExtAuthWithLocal() :: Check if local auth has already started:' + extInst.localAuthInit);

  //check if we have already started auth with server
  if (extInst.localAuthInit) {
    return;
  }
  extInst.localAuthInit = true;

  // dispatch event and check for cancel...
  var eventObj = {
      type: ssd.user.Auth.EventType.BEFORE_LOCAL_AUTH,
      'sourceId': sourceId
    };
  if (!this.dispatchEvent(eventObj)) {
    this.logger.info('_verifyExtAuthWithLocal() :: canceled due to event preventDefault');
    return;
  }

  // get local auth url from ext plugin if it exists
  var url = extInst.config('localAuthUrl');
  // get the accessToken
  var accessToken = extInst.getAccessToken();
  // create and start request
  var a = new ssd.ajax(url || this.config('localAuthUrl'), {
      postMethod: ssd.ajax.sendMethods.POST
    });
  a.addData(this.config('localAuthSourceId'), sourceId);
  a.addData(extInst.config('localAuthAccessToken') || this.config('localAuthAccessToken'), accessToken);

  // response from server
  a.callback = goog.bind(this._serverAuthResponse, this); //callback of AJAX

  //send the query
  a.send();
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
 * We expect:
 *   1. A boolean variable that informs us of the auth state
 *   2. In case we are authenticated a user data object
 *   3. In case we failed an optional error message
 *
 * @param {Object} response Response from server
 * @private
 */
ssd.user.AuthModel.prototype._serverAuthResponse = function(response) {
  this.logger.info('_serverAuthResponse() :: Init');

  var eventObj = {
      type: ssd.user.Auth.EventType.BEFORE_AUTH_RESPONSE,
      'response': response,
      'status'  : false,
      'errorMessage': ''
  };
  if (!this.dispatchEvent(eventObj)) {
    this.logger.info('_serverAuthResponse() :: canceled due to event preventDefault');
    return;
  }

  // from this point onwards we only emit one type of event:
  eventObj.type = ssd.user.Auth.EventType.AUTH_RESPONSE;

  // check if response is an object
  if (ssd.types.OBJECT != goog.typeOf(response)) {
    // error error
    this.logger.warning('_serverAuthResponse() :: response is not an object');
    eventObj['errorMessage'] = 'response not of type Object';
    this.dispatchEvent(eventObj);
    return;
  }

  // get the statusObject
  var statusObject = ssd.helpers.getStatusObject(this.config);

  // check if we have status to check
  if (statusObject.hasStatus) {
    // yes we do... check the response
    if (statusObject.valuator !== response[status]) {
      // operation has failed...
      this.logger.info('_serverAuthResponse() :: operation got a false response');
      eventObj['errorMessage'] = 'server said no dice';
      this.dispatchEvent(eventObj);
      return;
    }
  }

  // we had a successful operation, attempt to fetch the user data object
  var user;
  try {
    user = response[this.config('userKey')];
  } catch(e){}

  // check the user data object is valid
  if (!this._user.validate(user)) {
    this.logger.info('_serverAuthResponse() :: not a valid user data object');
    eventObj['errorMessage'] = 'user data object not valid';
    this.dispatchEvent(eventObj);
    return;
  }

  // all looks good
  this.logger.info('_serverAuthResponse() :: Adding user data object:' + goog.debug.deepExpose(user));
  this._user.addAll(user);
  eventObj['status'] = true;
  this.dispatchEvent(eventObj);

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
  this.dispatchEvent(ssd.user.Auth.EventType.AUTH_CHANGE);
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
  return this._isAuthed && this._user.get(ssd.conf.user.typeMappings.ownuser.verified);
};

/**
 * Logout from all auth sources, clear data objects
 * and dispose everything
 * @return {void}
 */
ssd.user.AuthModel.prototype.logout = function() {
  // clear our dynamic map data object
  this._user.clear();

  // we used goog.mixin() to do multiple inheritance for
  // events, thus we have to directly call event's disposeInternal
  goog.events.EventTarget.disposeInternal.call(this._user);

  this._doAuth(false);
};


