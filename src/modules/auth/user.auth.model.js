/**
 * @fileoverview The basic methods related to used authentication.
 * This class should never get instanciated, use the "controller" class
 * instead that extends this one: 'ssd.user.Auth'.
 */

goog.provide('ssd.user.AuthModel');

goog.require('goog.async.Deferred');
goog.require('goog.json');

goog.require('ssd.core.config');
goog.require('ssd.user.auth.EventType');
goog.require('ssd.user.auth.config');
goog.require('ssd.Module');
goog.require('ssd.ajax');

/**
 * User authentication class
 *
 * @constructor
 * @extends {ssd.Module}
 */
ssd.user.AuthModel = function() {
  goog.base(this);


  /**
   * @type {boolean}
   * @private
   */
  this._isAuthed = false;

  /**
   * The user data object
   *
   * @type {ssd.user.OwnItem}
   * @private
   */
  this._dynmapUdo = new ssd.user.OwnItem();
  // pipe the user object events to this class
  this._dynmapUdo.addEventListener(ssd.structs.DynamicMap.EventType.BEFORE_SET,
    this._dataEvent, false, this);
  this._dynmapUdo.addEventListener(ssd.structs.DynamicMap.EventType.AFTER_SET,
    this._dataEvent, false, this);
  this._dynmapUdo.addEventListener(ssd.structs.DynamicMap.EventType.BEFORE_ADDALL,
    this._dataEvent, false, this);
  this._dynmapUdo.addEventListener(ssd.structs.DynamicMap.EventType.AFTER_ADDALL,
    this._dataEvent, false, this);

  this.get = this._dynmapUdo.get;
  this.set = this._dynmapUdo.set;

  /**
   * A map of third party auth source plugins.
   *
   * The source id will be used as key and the
   * instantiation of the plugin will be the value
   *
   * @private
   * @type {ssd.structs.Map.<ssd.user.types.extSourceId,
   *   ssd.user.Auth.SourceItem>}
   */
  this._mapSources = new ssd.structs.Map();
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

  var sourceItem = this._mapSources.get(e.target.SOURCEID);
  sourceItem.initAuthStatus = true;

  // if not authed no need to go further
  if (!e.target.isAuthed()) {
    this._mapSources.set(e.target.SOURCEID, sourceItem);
    this._checkInitAuthComplete();
    return;
  }

  // User is authed with that source. Save it to the map.
  sourceItem.isAuthed = true;
  this._mapSources.set(e.target.SOURCEID, sourceItem);

  // check if this auth plugin requires authentication with the server
  this.verifyExtAuthWithLocal( e.target.SOURCEID )
    .addBoth(function(){
      this._checkInitAuthComplete();
    }, this);
};

/**
 * Will check if all auth plugins have reported in initial auth state.
 *
 * @private
 */
ssd.user.AuthModel.prototype._checkInitAuthComplete = function() {
  this.logger.info('_checkInitAuthComplete() :: Init.');
  var isComplete = true;
  this._mapSources.forEach(function( sourceId, sourceItem){
    if (!sourceItem.initAuthStatus) {
      isComplete = false;
    }
  }, this);

  if (isComplete) {
    this.logger.shout('_checkInitAuthComplete() :: All initial auth ' +
      'checks complete. Instance:' + this._ssdInst._instanceCount);

      var eventObj  = {
        authState: this.isAuthed(),
        type: ssd.user.auth.EventType.INITIAL_AUTH_STATE
      };
      this.dispatchEvent(eventObj);
  }
};

/**
 * Listener for external (FB, TW ...)  auth state change events.
 *
 * @private
 * @param {goog.events.Event} e
 */
ssd.user.AuthModel.prototype._authChange = function(e) {
  this.logger.info('_authChange() :: Auth CHANGE dispatched from:' +
    e.target.SOURCEID + ' Authed:' + e.target.isAuthed());

  // check if in our authed map
  var extItem = this._mapSources.get(e.target.SOURCEID);
  var isExtAuthed = extItem.isAuthed;

  // If authed and we already have it in map then it's a double trigger, ignore
  if (e.target.isAuthed() === isExtAuthed) {
    this.logger.warning('_authChange() :: BOGUS situation. Received auth ' +
      'event but we already had a record of this source being authed. ' +
      'Double trigger');
    return;
  }

  // change the status
  extItem.isAuthed = e.target.isAuthed();
  this._mapSources.set(e.target.SOURCEID, extItem);

  if (isExtAuthed) {
    this.verifyExtAuthWithLocal(e.target.SOURCEID);
  } else {
    this._checkAuthState();
  }
};

/**
 * Checks the auth state of all sources and determines the global state.
 * @private
 */
ssd.user.AuthModel.prototype._checkAuthState = function() {
  this.logger.info('_checkAuthState() :: Init.');

  var authState = false;
  this._mapSources.forEach( function(key, item) {
    if (item.isAuthed) {
      authState = true;
    }
  }, this);

  if ( this.isAuthed() === authState ) {
    return;
  }

  this.logger.info('_checkAuthState() :: NEW AUTH STATE:' + authState);

  // there is a change of auth state
  this._doAuth( authState );

};



/**
 * When an external auth source changes state and becomes authenticated
 * this method is invoked to inform the server.
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
    ' sourceId :' + sourceId );

  // get plugin item
  var extItem = this._mapSources.get(sourceId);

  // get plugin instance
  var extInst =extItem.inst;

  // dispatch event and check for cancel...
  var eventObj = {
      type: ssd.user.auth.EventType.BEFORE_EXT_LOCAL_AUTH,
      'sourceId': sourceId
    };

  if (!this.dispatchEvent(eventObj)) {
    this.logger.info('_verifyExtAuthWithLocal() :: canceled due to ' +
      'event preventDefault');
    def.errback('preventDefault called on verifyExtAuthWithLocal');
    return def;
  }

  // check if this auth plugin does not require authentication with the server
  if ( extInst.config( ssd.user.auth.config.Key.EXT_SOURCES_TO_LOCAL ) &&
      // Check if auth with server is disabled
      this.config( ssd.user.auth.config.Key.EXT_SOURCES_TO_LOCAL ) ) {

    // No verification with server is allowed by config.
    // authenticate the user.
    this._doAuth( true );
    def.callback( true );
    return def;
  }

  //
  // Prepare the ajax call
  //
  // get local auth url from ext plugin or use default one.
  var url = extInst.config( ssd.user.auth.Key.EXT_SOURCES_AUTH_URL ) ||
    this.config( ssd.user.auth.Key.AUTH_URL );

  var data = {},
      paramSource = this.config( ssd.user.auth.Key.PARAM_SOURCE_ID ),
      paramAccessToken = this.config( ssd.user.auth.Key.PARAM_ACCESS_TOKEN );

  data[paramSource] = sourceId;
  data[paramAccessToken] = extInst.getAccessToken();


  return this.performLocalAuth( url, data );

};


/**
 * When an external auth source changes state and becomes authenticated
 * we use this method to inform the server.
 *
 * The server will then determine if we are eligible to get authenticated
 * using that provider and if we are, an auth session is created.
 *
 * @protected
 * @param {string} url The url.
 * @param {Object} data The data.
 * @return {goog.async.Deferred}
 */
ssd.user.AuthModel.prototype.performLocalAuth = function( url, data ) {
  var def = new goog.async.Deferred();

  this.logger.info('performLocalAuth() :: Init. url:' + url);

  // dispatch event and check for cancel...
  var eventObj  = {
    'data': data,
    type: ssd.user.auth.EventType.BEFORE_LOCAL_AUTH
  };

  // add a backpipe in case listener needs to chang data
  var backPipe = ssd.eventBackPipe( eventObj, data );

  if (!this.dispatchEvent( eventObj )) {
    this.logger.info('performLocalAuth() :: canceled due to ' +
      'event preventDefault');
    def.errback('preventDefault canceled the op');
    return def;
  }

  data = backPipe();

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
 * In this method it is determined if:
 *   1. The operation succeeded
 *   2. We received a positive or negative response from the server
 *
 * @param  {ssd.ajax.ResponseObject} response The response object.
 * @return {goog.async.Deferred} A deferred.
 * @private
 */
ssd.user.AuthModel.prototype._serverAuthResponse = function( response ) {
  var def = new goog.async.Deferred();

  this.logger.info('_serverAuthResponse() :: Init');

  var eventObj = {
    type: ssd.user.auth.EventType.ON_AUTH_RESPONSE,
    'responseRaw': response.responseRaw,
    'httpStatus': response.httpStatus,
    'ajaxStatus': response.success,
    'authState': false,
    'errorMessage': response.errorMessage
  };

  // dispatch event and check if don't want exec.
  if ( false === this.dispatchEvent(eventObj) ) {
    this.logger.info('_serverAuthResponse() :: canceled due to ' +
      'event preventDefault');
    def.errback('preventDefault canceled resp op');
    return def;
  }

  // switch event type
  eventObj.type = ssd.user.auth.EventType.AFTER_AUTH_RESPONSE;

  // Check if ajax op was successful
  if ( !response.success ) {
    this.logger.warning('_serverAuthResponse() :: xhr operation was not a success');
    this.dispatchEvent(eventObj);
    def.errback('xhr failed');
    return def;
  }

  // try to parse the response
  var responseParsed, udo;
  if ( this.config( ssd.user.auth.config.Key.RESPONSE_AUTH_JSON )) {
    /** @preserveTry */
    try {
      responseParsed = goog.json.parse(response.responseRaw);
    } catch(ex) {
      this.logger.warning('_serverAuthResponse() :: response failed' +
        ' to parse as JSON');
      eventObj['errorMessage'] = 'response not JSON';
      this.dispatchEvent(eventObj);
      def.errback('resp not JSON');
      return def;
    }

    // check if status check is enabled.
    if (this.config( ssd.core.config.Key.STATUS_ENABLED )) {
      // fetch the value of the status and compare it
      var valuator = this.config( ssd.core.config.Key.STATUS_VALUATOR );
      var statusKey = this.config( ssd.core.config.Key.STATUS_KEY );

      if (valuator !== responseParsed[statusKey]) {
        // operation has failed...
        this.logger.warning('_serverAuthResponse() :: operation got a false response');
        eventObj['errorMessage'] = 'status failed';
        this.dispatchEvent(eventObj);
        def.callback(false);
        return def;
      }
    }

    var udoKey = this.config(ssd.user.auth.config.Key.RESPONSE_KEY_UDO);

    if (udoKey && udoKey.length) {
      /** @preserveTry */
      try {
        udo = responseParsed[udoKey];
      } catch(e){}
    } else {
      udo = responseParsed;
    }

  } else {
    responseParsed = udo = response.responseRaw;
  }

  // auth method will also validate.
  if ( !this.auth(udo) ) {
    eventObj['errorMessage'] = 'user data object not valid';
    this.dispatchEvent(eventObj);
    def.errback('udo not valid');
    return def;
  }

  eventObj['udo'] = udo;
  eventObj['authState'] = true;
  this.dispatchEvent(eventObj);

  def.callback({
    authState: true,
    udo: udo,
    response: response.responseRaw
  });
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
    'authState': isAuthed,
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
  return this._mapSources.get(sourceId) || false;
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


