/**
 * @fileoverview The basic methods related to used authentication.
 * This class should never get instanciated, use the "controller" class
 * instead that extends this one: 'ssd.user.Auth'.
 */

goog.provide('ssd.user.AuthModel');

goog.require('goog.json');

goog.require('ssd.core.config');
goog.require('ssd.user.auth.Response');
goog.require('ssd.user.auth.EventType');
goog.require('ssd.user.auth.config');
goog.require('ssd.Module');
goog.require('ssd.sync');

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

  /**
   * An array containing the id's of all the ext sources that are currently
   * authenticated.
   * @type {Array.<ssd.user.types.extSourceId>}
   */
  this._authedSources = [];

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
      'authState': this.isAuthed(),
      type: ssd.user.auth.EventType.INITIAL_AUTH_STATE
    };
    this.dispatchEvent(eventObj);
  }
};

/**
 * Listener for external (FB, TW ...)  auth state change events.
 *
 * @private
 * @param {goog.events.Event} ev
 */
ssd.user.AuthModel.prototype._authChange = function( ev ) {

  var plugin = ev.target;

  // stop propagation, it will be re-emit by this method so it's
  // surely the first that bubles up.
  ev.stopPropagation();

  this.logger.info('_authChange() :: AUTH CHANGE dispatched from:' +
    plugin.SOURCEID + ' Authed:' + plugin.isAuthed());

  var def = when.defer();

  // check if a backpipe is provided and return the promise.
  var backpipe = ev[ssd.BACKPIPE_KEY];
  if ( goog.isFunction(backpipe) ) {
    backpipe(function() {
      return def.promise;
    });
  }

  // re-emit the event
  var pluginRespObj = new ssd.user.auth.plugin.Response(ev);
  var eventObj = pluginRespObj.event(ev.type, ev.target);
  if ( false === this.dispatchEvent(eventObj) ) {
    // canceled
    this.logger.warning('_authChange() :: event "' + ev.type + '" canceled');
    return def.reject('canceled');
  }

  // get saved auth state from the sources map
  var extItem = this._mapSources.get(plugin.SOURCEID);
  var isExtAuthed = extItem.isAuthed;

  // If authed and we already have it in map then it's a double trigger, ignore
  if (plugin.isAuthed() === isExtAuthed) {
    this.logger.warning('_authChange() :: BOGUS situation. Received auth ' +
      'event but we already had a record of this source being authed. ' +
      'Double trigger');
    return def.reject('double trigger');
  }

  // change and store  authState
  extItem.isAuthed = plugin.isAuthed();
  this._mapSources.set(plugin.SOURCEID, extItem);


  // allow for the event to propagate and resume execution right after that.
  // not an elegant solution, refactor
  //ssd.fork(this._authChangePayload, this, def, extItem, plugin, ev);
  this._authChangePayload( def, extItem, plugin, ev);

  return def.promise;
};

/**
 * Async followup of _authChange method.
 *
 * @param  {when.Deferred} def the def.
 * @param  {sdd.user.auth.SourceItem} extItem the extItem.
 * @param  {ssd.user.auth.PluginModule} plugin the plugin.
 * @param  {goog.event.Event} ev the ev.
 * @private
 */
ssd.user.AuthModel.prototype._authChangePayload = function( def, extItem,
  plugin, ev ) {
  var promise;
  // dangle a bit to keep the _authedSources array updated
  if ( extItem.isAuthed ) {
    if ( -1 === this._authedSources.indexOf(plugin.SOURCEID) ) {
      this._authedSources.push( plugin.SOURCEID );
    }

    promise = this.verifyExtAuthWithLocal(plugin.SOURCEID);

  } else {
    var pluginIndex = this._authedSources.indexOf(plugin.SOURCEID);
    if ( 0 <= pluginIndex) {
      this._authedSources.splice(pluginIndex, 1);
    }

    promise = this._checkAuthState();
  }

  // when response comes back, extend it with the properties of the event obj
  // (for now just passes responsePluginRaw prop)
  promise.then(function(respObjAuth){
    var respObj = new ssd.user.auth.plugin.Response( respObjAuth );
    respObj.extend(ev);
    def.resolve(respObj);
  }, def.reject);

};

/**
 * Checks the auth state of all sources and determines the global state.
 *
 * @private
 * @return {when.Promise} a promise.
 */
ssd.user.AuthModel.prototype._checkAuthState = function() {
  this.logger.info('_checkAuthState() :: Init.');
  var def = when.defer();
  var authState = false;

  this._mapSources.forEach( function(key, item) {
    if (item.isAuthed) {
      authState = true;
    }
  }, this);

  if ( this.isAuthed() === authState ) {
    return def.resolve(true);
  }

  this.logger.info('_checkAuthState() :: NEW AUTH STATE:' + authState);

  // there is a change of auth state
  return this._doAuth( authState );
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
 * @return {when.Promise}
 */
ssd.user.AuthModel.prototype.verifyExtAuthWithLocal = function( sourceId ) {
  var def = when.defer();

  this.logger.info('_verifyExtAuthWithLocal() :: Init. LocalAuth Switch:' +
    ' sourceId: ' + sourceId );

  // get plugin item
  var extItem = this._mapSources.get(sourceId);

  // get plugin instance
  var extInst = extItem.inst;

  // dispatch event and check for cancel...
  var eventObj = {
      type: ssd.user.auth.EventType.BEFORE_EXT_LOCAL_AUTH,
      'sourceId': sourceId
    };

  if (!this.dispatchEvent(eventObj)) {
    this.logger.info('_verifyExtAuthWithLocal() :: canceled due to ' +
      'event preventDefault');
    return def.reject('preventDefault called');
  }

  // check if this auth plugin does not require authentication with the server
  if ( extInst.config( ssd.user.auth.config.Key.EXT_SOURCES_TO_LOCAL ) &&
      // Check if auth with server is disabled
      this.config( ssd.user.auth.config.Key.EXT_SOURCES_TO_LOCAL ) ) {

    // No verification with server is allowed by config.
    // authenticate the user.
    return this._doAuth( true );
  }

  //
  // Prepare the ajax call
  //
  // get local auth url from ext plugin or use default one.
  var url = extInst.config( ssd.user.auth.config.Key.EXT_SOURCES_AUTH_URL ) ||
    this.config( ssd.user.auth.config.Key.LOGIN_URL );

  var data = {},
      paramSource = this.config( ssd.user.auth.config.Key.PARAM_SOURCE_ID ),
      paramAccessToken = this.config( ssd.user.auth.config.Key.PARAM_ACCESS_TOKEN );

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
 * @return {when.Promise}
 */
ssd.user.AuthModel.prototype.performLocalAuth = function( url, data ) {
  var def = when.defer();
  this.logger.info('performLocalAuth() :: Init. url:' + url);

  // check if local auth enabled
  if (! this.config( ssd.user.auth.config.Key.HAS_LOCAL_AUTH )) {
    this.logger.info('performLocalAuth() :: local auth is disabled');
    this._doAuth( true );
    return def.reject( true );
  }


  // dispatch event and check for cancel...
  var eventObj  = {
    'data': data,
    type: ssd.user.auth.EventType.BEFORE_LOGIN
  };

  // add a backpipe in case listener needs to chang data
  var backPipe = ssd.eventBackPipe( eventObj, data );

  if (!this.dispatchEvent( eventObj )) {
    this.logger.info('performLocalAuth() :: canceled due to ' +
      'event preventDefault');
    return def.reject('preventDefault called');
  }

  data = backPipe();

  this.logger.fine('performLocalAuth() :: sending request...');
  ssd.sync.send( url, null, ssd.ajax.Method.POST, data )
    .then(goog.bind(this._serverAuthResponse, this), def.reject)
    .then(def.resolve, def.reject);

  return def.promise;
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
 * @param  {ssd.sync.Response} response The response object.
 * @return {when.Promise} A promise.
 * @private
 */
ssd.user.AuthModel.prototype._serverAuthResponse = function( respObjSync ) {
  var def = when.defer();

  this.logger.info('_serverAuthResponse() :: Init');

  var respObj = new ssd.user.auth.Response( respObjSync );
  respObj['authState'] = this.isAuthed();

  var eventObj = respObj.event(ssd.user.auth.EventType.ON_LOGIN_RESPONSE, this);

  // dispatch event and check if don't want exec.
  if ( false === this.dispatchEvent(eventObj) ) {
    this.logger.info('_serverAuthResponse() :: canceled due to ' +
      'event preventDefault');
    return def.reject('preventDefault canceled resp op');
  }

  // switch event type
  eventObj.type = ssd.user.auth.EventType.AFTER_LOGIN_RESPONSE;
  // Check if ajax op was successful
  if ( !respObjSync['success'] ) {
    this.logger.warning('_serverAuthResponse() :: xhr operation was not a success');
    this.dispatchEvent(eventObj);
    return def.reject('xhr failed');
  }

  // try to parse the response
  var responseParsed, udo;
  if ( this.config( ssd.user.auth.config.Key.RESPONSE_AUTH_JSON )) {
    /** @preserveTry */
    try {
      responseParsed = goog.json.parse(respObjSync['responseRaw']);
    } catch(ex) {
      this.logger.warning('_serverAuthResponse() :: response failed' +
        ' to parse as JSON');
      eventObj['errorMessage'] = 'response not JSON';
      this.dispatchEvent(eventObj);
      return def.reject(eventObj['errorMessage']);
    }

    // check if status check is enabled.
    if (this.config( ssd.core.config.Key.STATUS_ENABLED )) {
      // fetch the value of the status and compare it
      var valuator = this.config( ssd.core.config.Key.STATUS_VALUATOR );
      var statusKey = this.config( ssd.core.config.Key.STATUS_KEY );

      if (valuator !== responseParsed[statusKey]) {
        // operation has failed...
        this.logger.warning('_serverAuthResponse() :: operation got a false response');
        respObj['errorMessage'] = eventObj['errorMessage'] = 'status failed';
        this.dispatchEvent(eventObj);
        return def.resolve( respObj );
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
    responseParsed = udo = respObjSync['responseRaw'];
  }

  respObj['udo'] = udo;
  respObj['serverRaw'] = responseParsed;

  eventObj = respObj.event(ssd.user.auth.EventType.AFTER_LOGIN_RESPONSE, this);
  this.dispatchEvent(eventObj);

  // auth method will also validate.
  if ( !this.auth(udo) ) {
    eventObj['errorMessage'] = 'user data object not valid';
    this.dispatchEvent(eventObj);
    return def.reject('udo not valid');
  }

  respObj['authState'] = true;
  return def.resolve(respObj);
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
 * @return {when.Promise} a promise.
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
  return when.resolve(isAuthed);
};

/**
 * Return an array of string with the id's of external sources
 * that are authenticated.
 *
 * @return {Array.<ssd.user.types.extSourceId>} An array of strings.
 */
ssd.user.AuthModel.prototype.authedSources  = function() {
  return Array.prototype.slice.call(this._authedSources, 0);
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




