/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 31/May/2010
 *
 *********
 *  File:: network/ajax.js
 *  Platform safe Ajax class
 *********
 */

/**
 * Provide the Ajax namespace
 *
 */
goog.provide('core.ajax');



/**
* Main Ajax Class for desktop (browser) and mobiles
*
* The 2nd param is for object's parameters:
* typeSend :: XML, Text, JSON
* typeGet :: XML, Text, JSON
* postMethod :: POST, GET
* origin :: The origin variable used for navigation submition in the spot's engine
* jqMsg :: The jQuery result of msg_ type  divs (if in web)
* bare :: If set to true we will not pass standar spot parameters like g/s/origin etc
* showMsg :: boolean, display alert message on success [default: true]
* showErrorMsg :: boolean, display alert message on error [default: true]
* oper :: {string} If this is a named operation use object from core.update.oper
* loadertype :: {core.update.LOADERTYPES=} loader type for mobiles
* noLog:: {boolean} if we want silent loging
*
* @constructor
* @param {string} url The URL we will contact for connection
* @param {Object} params the parameters for the AJAX execution
* @param {Function=} opt_callback The call back function for execution when we have a response
*/
core.ajax = function(url, params, opt_callback)
{
    var c = core;
    var db = c.ajax.dbstatic;
    var g = goog;
    var log = g.debug.Logger.getLogger('core.ajax');

    log.fine('Init');

    /**
     * Environment indicator
     *
     * Will let us know on which platform
     * we are running. Values:
     * w : Webkit, mozila, opera browser
     * t : Mobile platform, Titanium
     * ie: Internet Explorer
     *
     * @private
     * @type {string}
     */
    this.env = '';




    /**
     * The ajax object container
     *
     * @type {object|null}
     */
    this.ajax = null;

    /**
     * Instance's callback property
     *
     * @type {Function}
     */
    this.callback = opt_callback || function(){};

    /**
     * Instance's error callback property
     *
     * @type {Function}
     */
    this.errorCallback = function () {};

    /**
     * The data we will send
     */
    this.sendData = null;


    /**
     * Sending / waiting request in progress switch
     *
     * @type {boolean}
     */
    this.sending = false;

    /**
     * Will inform us if we don't need error handling
     * from this class
     *
     * @private
     * @type {boolean}
     */
    this._noErrorHandling = false;

    /**
     * If we need browser caching switch
     *
     * @private
     * @type {boolean}
     */
    this._isstatic = false;

    /**
     * This var we pass as is
     *
     * @private
     * @type string passRaw
     */
    this._passRaw = "";


    /**
     * Our instance's DB object
     *
     * @enum {mixed}
     */
    this.db = {
        url: url,
        p: eval(params),
        /**
         * The data we want to pass through XML or JSON will be stored here
         * @type {Object}
         */
        passData: {},
        /**
         * If we have any data to sent switch
         * @type {boolean}
         */
        hasData: false,
        /**
         * Server's responce to our request will
         * be stored here
         *
         * @type {object|null}
         */
        result: null,
        /**
         * The JSON data object container
         * Each request we make fills this object
         *
         * @type {object|null}
         */
         json: null,
         /**
          * For mobile when we have a file upload
          * we open this switch
          *
          * @type {boolean}
          */
         isUpload: false
    };


    //validate parameters
    if (!g.isString(this.db.p.action)) this.db.p.action = '';
    if (!g.isString(this.db.p.typeSend)) this.db.p.typeSend = 'html';
    if (!g.isString(this.db.p.typeGet)) this.db.p.typeGet = 'json';
    if (!g.isString(this.db.p.postMethod)) this.db.p.postMethod = 'GET';
    //if (!g.isNumber(this.db.p.origin)) {
    //    log.warning('Origin not a number. oper:' + this.db.p['oper']);
    //}
    if (!g.isBoolean(this.db.p.showMsg))
        this.db.p.showMsg = false;

    if (!g.isBoolean(this.db.p.showErrorMsg))
        this.db.p.showErrorMsg = true;



    /**
    * Local error object handler
    *
    * core.ajax.ERRORSTATUS = {
    *       NOAJAX: 10, // Client does not support AJAX
    *       REQFAIL: 20, // Request to Server failed, HTTP Status not 200
    *       XMLNULL: 30, // XML respose from server is null
    *       JSONPARSE: 40, // JSON string from server did not parse
    *       SERVERERROR: 50 // Server error
    *       INJECT: 60 // server requested something serious (logout, reinit for mobs)
    * }
    *
    * @private
    * @enum {number|text}
    */
    this._errorObj = { //new Error(); old way using native Error object... need more expertise to implement it
        /**
         * Erros status
         * @type {core.ajax.ERRORSTATUS}
         */
        status: 0,
        message: '',
        debugmessage: '',
        serverStatus: 0
    };


    /**
     * Now get current environment we run on
     *
     */
    if (c.MOBILE) {
        // mobile environment
        this.env = 't';
    } else {
        // we are on the web
    	// check for jQuery message element or use default
    	if (!c.isjQ(this.db.p.jqMsg))
    		this.db.p.jqMsg = jQuery("#master_alert");




        if (window.XMLHttpRequest) {
            // we have XMLHttpRequest (mozila, webkit, etc)
            this.env = 'w';
        } else if (window.ActiveXObject) {
                // internet explorer
                this.env = 'ie';
        } else {
            // bogus (!)
            log.severe('We have window set but not support XMLHttpRequest or ActiveXObject. Falling back to mobile API');
            this.env = 't';
        }
    }

    // in case of mobile, do not show success messages...
    if ('t' == this.env)
        this.db.p.showMsg = false;
    return this;

}; // core.ajax constructor


/**
 * Define our static DB
 *
 * @enumb {mixed}
 */
core.ajax.dbstatic = {
   /**
    * For web store session token and id here
    */
   session: {
       sessid: null,
       sesstoken: null,
       sessSourceId: null
   }
}; // core.ajax.dbstatic

/**
 * Define error  Statuses
 *
 * @define {object}
 * @enum {number}
 */
core.ajax.ERRORSTATUS = {
    NOAJAX: 10, // Client does not support AJAX
    REQFAIL: 20, // Request to Server failed, HTTP Status not 200
    XMLNULL: 30, // XML respose from server is null
    JSONPARSE: 40, // JSON string from server did not parse
    SERVERERROR: 50, // Server error
    INJECT: 60, // server requested something serious (logout, reinit for mobs)
    TIMEOUT: 70 // timeout (!)
}; //core.ajax.ERRORSTATUS

/**
* adds a parameter to the local data object which
* will be used when sending data
* to the server as XML or JSON
*
* @param {string} key The key of the data to be added
* @param {mixed} valuedata The value we need to store
* @param {boolean=} opt_passBare optionaly set this to true if we need to pass the value as is
* @return {void}
*/
core.ajax.prototype.addData = function (key, valuedata, opt_passBare)
{
    var g = goog;
    var geoc = core;
    // decide on env
    var m = web;

    var passBare = opt_passBare || false;

    //if nothing do nothing
    if (!g.isString(key)) return;

    // check type of key
    if (g.isObject(key)) {
        //key is an object, go through the values
        g.object.forEach(key, function(val, index){
            this.db.passData[index] = geoc.encURI(val);
        });
    } else {
        // key is string
        /**
         * Some notes... 14/10/2010
         * first, we only accept a string key (not object)
         * so above if statement is obsolete...
         *
         * next... we don't encURI at this point anymore
         * instead we endURI in this._compilePassData
         * so that we don't interfere with JSON.stringify
         */

        if (true) { //this.db.isUpload) {
            // pass values as they are
            this.db.passData[key] = valuedata;
            this.db.hasData = true;
            return;
        }
        //check if we have an array or object
        // and URI the contents, not the whole object...
        var clean = '';
        if (g.isObject(valuedata) && !passBare) {
            var clean = {};
            g.object.forEach(valuedata, function(val, index){
                clean[index] = geoc.encURI(val);
            });
        } else if (g.isArray(valuedata) && !passBare) {
            var clean = [];
            g.array.forEach(valuedata, function (val, index){
                clean[index] = geoc.encURI(val);
            });
        } else {
            if (passBare)
                clean = valuedata;
            else
                clean = geoc.encURI(valuedata);
        }

        this.db.passData[key] = clean;
    }

    // open hasData switch
    this.db.hasData = true;
}; //method core.ajax.addData


/**
* We will send data to the server and
* listen for a reply using this method
*
* @return {boolean} true / false
*/
core.ajax.prototype.send = function() {
    // decide on env, set m root
    var m = web;

    var wa = core.ajax;
    var g = goog;

    var log = core.log('core.ajax.send');
    var _this = this;


    log.fine('Init');


    if (this.updating) {
        log.warning('updating is true, exiting');
        return false;
    }
    //log.shout('this:' + g.debug.expose(this));

    //reset local variables
    this.db.result = null;

    // reset the error object
    this._errorObj.status = 0;
    this._errorObj.message = '';
    this._errorObj.debugmessage = '';
    this._errorObj.serverStatus = 0;
    this._noErrorHandling = false;


    // initialise AJAX object
    if (!this._initAjaxObject()) {
        log.severe('Could not init AJAX Class / API');
        return false; // could not init ajax class / API
    }


    // set the responce handlers
    this._setupAjaxHandlers();



    // check if this is a named operation
    if (g.isString(this.db.p.oper)) {
        // it is, release control to update class
        //log.info('calling update. params:' + g.debug.expose(this.db.p));

        return true;
    } else {
        // non named operation, execute as is...
        this._sendActual();
    }

    log.fine('Finish');
    return true;
}; // method core.ajax.send

/**
 * The actual payload of ajax send operation
 *
 * Will get executed directly by ajax.send() or through
 * the update subclass of ajax in case this is a named
 * operation
 *
 * @private
 * @return {void}
 */
core.ajax.prototype._sendActual = function ()
{
    try {


    // decide on env, set m root
    var m = web;
    var c = core;
    var wa = c.ajax;
    var g = goog;

    var log = core.log('core.ajax._sendActual');
    var _this = this;

    log.fine('Init');

    /**
     * Prepare and send the request
     *
     * All platforms have same methods
     *
     */
    this.sending = true;
    var dt = new Date();

    // prepare our data to send
    var sendData = this.sendData = this._compilePassData();

    // check for environment and initialise uri var
    if ('t' == this.env)
        var uri = m.URL; // set http://site.com
    else
        var uri = '';

    // see if we want to POST or we are in mobile mode (POST ALL)
    if (/post/i.test(this.db.p.postMethod) || c.MOBILE) {

        if (this.db.isUpload)
            var async = false;
        else
            var async = true;

        uri += this.db.url + '?' + dt.getTime();
        this.ajax.open("POST", uri, async);
        if (!this.db.isUpload)
            this.ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded;charset=UTF-8");
        this.ajax.send(sendData);
    } else {

        uri += this.db.url + '?' + sendData;
        if (!this._isstatic)
            uri +='&t=' + (dt.getTime());
        this.ajax.open("GET", uri, true);
        this.ajax.send(null);

    }


    if (this.db.p.noLog)
      log.fine('Performed Send, uri:' + uri + ' ' + sendData);
    else
      log.info('Performed Send, uri:' + uri + ' ' + sendData);
    if ('object' == g.typeOf(sendData)) {
        //log.fine('sendData was an object:' + g.debug.deepExpose(sendData));

    }

    } catch(e) {core.error(e);}

}; // method core.ajax._sendActual

/**
 * Return a URI string that carries our session
 * information. To be appended on a raw query outside
 * of this class (e.g. FB connect for mobile)
 *
 * @return {string}
 */
core.ajax.prototype.getSessionString = function ()
{
    return this._compilePassData();
}; // core.ajax.getSessionString

/**
 * The ajax callback method
 *
 * @private
 * @param {this} thisobj
 * @return {void}
 */
core.ajax.prototype._sendCallback = function (thisobj)
{
    var g = goog;
    var _this = thisobj;
    var wa = core.ajax;

    try {

    var m = web;

    var log = core.log('core.ajax._sendCallback');

    if (this.db.p.noLog)
      log.fine('Init');
    else
      log.info('Init');

    // set sending to false...
    _this.sending = false;

    // check if this is a named operation
    if (g.isString(_this.db.p.oper)) {
        //wu(false);
    }
    log.fine('update run ok');
    // based on type decide way to get data
    switch(_this.db.p.typeGet) {
        case 'xml':
            _this.db.result = _this.ajax.responseXML;
            if (g.isNull(_this.db.result)) {
                _this._errorObj.status = wa.ERRORSTATUS.XMLNULL;
                _this._errorObj.message = 'Server trouble... Please retry';
                _this._errorObj.debugmessage = 'XML response from server did not parse correctly';
                // we had errors
                _this._sendErrorCallback(_this, true);
                return;
            }
            break;
        case 'html':
            if (g.isNull(_this.db.result)) {
                _this.db.result = _this.ajax.responseText;
            }
            break;
        case 'json':
            if (g.isNull(_this.db.result)) {
                _this.db.result = _this.ajax.responseText;
            }

            // parse incoming JSON
            try {
                _this.db.json = JSON.parse(_this.db.result);
            } catch(e) {
                //error, did json string did not parse correctly
                //alert ('err');
                log.severe('AJAX DIDNT PARSE. e.expose:'  + g.debug.expose(e) + ' result:' + this.db.result);

                _this._errorObj.status = wa.ERRORSTATUS.JSONPARSE;
                _this._errorObj.message = 'Oops, an unexpected error occured... Please retry';
                _this._errorObj.debugmessage = 'JSON response from server does not parse correctly :: ' + e.name;
                // we had errors
                _this._sendErrorCallback(_this, true);
                return;
            } //catch(e)
            break;
    } // switch

    // check if we had any errors...
    if (!_this._checkError()) {
        // we had errors
        _this._sendErrorCallback(_this, true);
        return;
    }

    // we have a valid responce from the server, check for injections
    if (!_this._checkInjections()) {
        log.warning('checkInjections failed. Exiting');
        return;
    }

    log.fine('checked injections');
    // check if we have a msg tag to display
    var msg = _this.getTag('msg');
    if (g.isString(msg) && '' != msg && _this.db.p.showMsg)
        m.ui.alert(msg, 'success', _this.db.p.jqMsg);

    log.fine('Calling callback. typeof callback:' + g.typeOf(_this.callback));
    //log.info('json:' + g.debug.expose(this.db.json));
    //log.info('result:' + g.debug.expose(this.db.result));
    // call callback
    _this.callback(_this.db.json || _this.db.result);

    log.fine('callback call Finished');


    } catch(e) {core.error(e);}

}; // method core.ajax._sendCallback

/**
* Checks if we had errors in execution.
*
* @private
* @return {boolean} True if we did not have any errors, false otherwise
*/
core.ajax.prototype._checkError = function()
{

	//var log = core.log('core.ajax.prototype._checkError');

	//log.info('Init. this._errorObj.status:' + this._errorObj.status);

    if (0 < this._errorObj.status)
        return false;

    // no errors, means we got a responce
    // check for a status if json...
    if ('json' == this.db.p.typeGet ) {
        // check for server status
        var st = this.getTag('status');
        if ('' == st) st = 10;
        st = Number(st);
        //log.info('status:' + st);
        /*
        if (10 != st) {
            // we have an error from the server
            this._errorObj.status = core.ajax.ERRORSTATUS.SERVERERROR;
            this._errorObj.message = this.getTag('errorMsg');
            this._errorObj.debugmessage = this.getTag('errorEngine');
            this._errorObj.serverStatus = st;
            return false; // server returned an error
        }
        */
        // also check for new type of errors for BoothChat
        // (a string with name 'error')
        var er = this.getTag('error');
        if ('' !== er) {
            // we have an error from the server
            this._errorObj.status = core.ajax.ERRORSTATUS.SERVERERROR;
            this._errorObj.message = er;
            this._errorObj.debugmessage = er;
            this._errorObj.serverStatus = -1;
            return false; // server returned an error

        }
   } // if typeget is json

   return true;
}; //method checkError

/**
 * The ajax Error callback method
 *
 * This method may be called for a client side error
 * (e.g. AJAX not initialising, timeout, etc)
 *
 * or a server side error along with a complete
 * server error object.
 *
 * We decide what happened and act accordingly
 *
 * @private
 * @param {this} thisobj
 * @param {boolean=} opt_noupdate if true we will not call core.update(false)
 * @return {void}
 */
core.ajax.prototype._sendErrorCallback = function (thisobj, opt_noupdate)
{
    var c = core;
    var wa = c.ajax;
    var g = goog;

    try {


        var m = web;

    var log = core.log('core.ajax._sendErrorCallback');

    log.warning('Init - ERROR. status:' + thisobj._errorObj.status
    + ' serverStatus:' + thisobj._errorObj.serverStatus
    + ' message:' + thisobj._errorObj.message
    + ' debugmessage:' + thisobj._errorObj.debugmessage );


    // set sending to false...
    thisobj.sending = false;

    // check if this is a named operation
    if (g.isString(thisobj.db.p.oper) && !opt_noupdate) {

    }

    //call possible errorCallback function
    thisobj.errorCallback(thisobj._errorObj);

    // check if we don't want to handle errors
    if (thisobj._noErrorHandling) return;

    // Init our error msg var for the user
    var userErrorMsg = '';

    // check if not server error
    if (wa.ERRORSTATUS.SERVERERROR != thisobj._errorObj.status) {
        // store the default error message...
        userErrorMsg = 'Snap! Something went wrong, sorry! Please retry';
    } else {
        // user stored server message
        userErrorMsg = thisobj._errorObj.message;
    }

    // check if we are in browser mode and set our jq errorbox element
    // and display proper alert
    if (c.WEB) {
        log.info('thisobj.db.p.showErrorMsg:' + thisobj.db.p.showErrorMsg);
        if (thisobj.db.p.showErrorMsg)
            if (!c.isjQ(thisobj.db.p.jqMsg)) {
                log.warning('Message Box Element not set - handleErrors');
                thisobj.db.p.jqMsg = m.pe.msgbox.main;
                m.ui.alert(userErrorMsg, 'error', thisobj.db.p.jqMsg);
            } else {
                m.ui.alert(userErrorMsg, 'error', thisobj.db.p.jqMsg);
            }
    }
    return;


    } catch(e) {core.error(e);}

}; // method core.ajax._sendErrorCallback



/**
* Compiles the passData object to a string
* or JSON object URI compatible
* for sending to the server
*
* In case of upload (mob only) we return an object
*
* @private
* @return {string|object}
*/
core.ajax.prototype._compilePassData = function ()
{
    try {
    // decide on env, set m root
    var m = web;
    var g = goog;
    var log = core.log ('core.ajax._compilePassData');
    var geoc = core;

    log.fine('Init');

    // check for file upload, and divert execution
    if (this.db.isUpload)
        return this._compilePassDataUpload();

    var sReturn = '';

    switch(this.db.p.typeSend)
    {

        case 'json':
            // stringify and encode URI the return string
            if (this.db.hasData)
                sReturn = 'json=' + geoc.encURI(JSON.stringify(this.db.passData));
            else
                sReturn = 'json=' + geoc.encURI(JSON.stringify({dummy:true})) + '&';
            break;
        case 'xml':
            //ToDo implement XML Send
            break;
        default:
            //we will echo all the stored parameters as GET variables (!!)
            if (this.db.hasData) {
                g.object.forEach(this.db.passData, function(item, index) {
                    sReturn += '&' + index + '=' + geoc.encURI(item);  // we already are encURI'ed geoc.encURI(item);
                });
                //remove the first '&'
                sReturn = sReturn.substr(1);
            } //if we have data
            break;

    } //switch

    //add additional engine needed vars. If we are not in bare mode that is
    if (!this.db.p.bare)
    {
        if (this.db.hasData)
        {
            sReturn = sReturn + '&ajax=1'; //set that we come from ajax submition
        }
        else {
            sReturn = sReturn + 'ajax=1'; //set that we come from ajax submition
        }
        sReturn = sReturn + '&s=' + this.db.p.typeSend; //set the send type
        sReturn = sReturn + '&g=' + this.db.p.typeGet; //set the get type

        // pass session token now in case of web
        if (geoc.WEB) {
            sReturn += '&sessid=' + geoc.ajax.dbstatic.session.sessid;
            sReturn += '&sesstoken=' + geoc.ajax.dbstatic.session.sesstoken;
        }

        //check if we have origin in the params
        if (undefined != this.db.p.origin)
        {
            sReturn += "&o=" + this.db.p.origin;
        }

        if (g.isString(this.db.p.action))
        	sReturn += "&action=" + this.db.p.action;

        // check if in mobile mode and add additional needed variables
        if ('t' == this.env) {
            // shortcut assign mc.db.device
            var dbdev = m.db.device;
            // add the application version
            sReturn += '&mob=' + m.db.APPVER;
            // check if we init the session
            if (1000 != this.db.p.origin) {
                // not in init session, everything else
                // append the two needed tokens
                sReturn += '&clientid=' + m.net.db.session.clientid;
                sReturn += '&mobtoken=' + m.net.db.session.secrettoken;
            }
        }
    } //if not in bare mode

    //add the raw data
    if ('' != this._passRaw)
        sReturn += '&' + this._passRaw;



    return sReturn;
    } catch(e) {core.error(e);}
}; //method  core.ajax._compilePassData


/**
 * Initialises the ajax object (API)
 * depending on our current environment
 *
 * @private
 * @return {boolean}
 */
core.ajax.prototype._initAjaxObject = function()
{
    var g = goog;
    // decide on env, set m root
    var m = web;

    var log = core.log('core.ajax._initAjaxObject');

    // check on environment type
    switch(this.env) {
        case 't':
            // mobile Titanium
            // TBD
            break;
        case 'w':
            // webkit, mozilla, etc
            this.ajax = new window.XMLHttpRequest();
            break;
        case 'ie':
            // Internet Explorer
            this.ajax = new ActiveXObject("Microsoft.XMLHTTP");
            break;

    } // switch env type

    // check if we have an object
    if (g.isNull(this.ajax)) {
        this._errorObj.status = core.ajax.ERRORSTATUS.NOAJAX;
        this._errorObj.message = 'AJAX not supported by the client';

        return false;
    } //AJAX is not supported by the client

    return true;

}; // method core.ajax._initAjaxObject


/**
 * After a send has been executed
 * we call this method to setup
 * callback handlers for the ajax request
 * we made
 *
 * @private
 * @return {void}
 */
core.ajax.prototype._setupAjaxHandlers = function ()
{
    // decide on env, set m root
    var m = web;
    var wa = core.ajax;
    var g = goog;
    var log = core.log('core.ajax._setupAjaxHandlers');
    var _this = this;

    switch (this.env) {
        case 't':
            // Titanium API
            // TBD
            break;
        case 'w':
        case 'ie':
            // browser environment...
            this.ajax.onreadystatechange = function() {
                if (4 == _this.ajax.readyState) {
                    if (200 == _this.ajax.status) {
                        _this._sendCallback(_this);
                    } else {
                        // error
                        _this._errorObj.status = wa.ERRORSTATUS.REQFAIL;
                        _this._errorObj.message = 'Server has problems. Please retry';
                        _this._errorObj.debugmessage = 'Status not ok (200)';
                        _this._sendErrorCallback(_this);
                    }
                }
            };
            break;
    } // switch environment type

}; // method core.ajax._setupAjaxHandlers



/**
 * Will check the succesfully collected JSON object
 * for known injected values
 *
 * @private
 * @return {boolean} true if all ok, false if need to halt
 */
core.ajax.prototype._checkInjections = function()
{
    try {
    var g = goog;
    var c = core;
    var _this = this;

    // decide on env, set m root
    var m = web;

    var log = c.log('core.ajax._checkInjections');



    // check for faulty credentials
    // 14/Oct/2010 For now this has been deprecated for web... just for now (maybe)
    var faulty = this.getTag('FAULTYCREDS');
    if (faulty) {
        log.warning('Recieved FAULTYCREDS. Loging out...');
        // we have faulty credentials!
        this._errorObj.status = c.ajax.ERRORSTATUS.INJECT;
        this._errorObj.message = 'Please hang on...';
        this._errorObj.debugmessage = 'Server Injected FAULTYCREDS';
        // we had errors
        this._sendErrorCallback(this, true);

        // perform logout...
        if ('t' == this.env)
            m.user.logout();
        else
            m.user.auth.logout();

        return false;
    }

    // check for reinit:true provided by the server
    // when our session has expired or is not valid
    // will force us to reinit the network
    var reinit = this.getTag('reinit');
    if (reinit) {
        log.warning('Recieved reinit. Requesting new session...');

        /**
         * For web we have a tough cookie, user has to
         * refresh the page in order to get a new session
         * cookie. For now we will remove any session cookie
         * if it exists and prompt the user to refresh the page
         *
         */
        if (c.WEB) {
            log.severe('Server sent session reinit');
            // remove session cookie
            m.user.auth.removeCookie('geowarp_sess');

            this._errorObj.status = c.ajax.ERRORSTATUS.INJECT;
            this._errorObj.message = 'Your session has expired. Please refresh the page';
            this._errorObj.debugmessage = 'Server Injected reinit';

            this._sendErrorCallback(this, true);
        }

        /**
         * For mobiles only, we will attempt to re-init
         * our connection with the server
         * and hold the current request untill we get a reply.
         *
         * If session is restored ok we re-send our request
         */
        if (c.MOBILE) {
            m.net.initNetwork(true, g.bind(function(state){
                if (state) {
                    // ok got a new session, restart the request
                    _this._sendActual();
                } else {
                    // we had errors
                    _this._errorObj.status = core.ajax.ERRORSTATUS.INJECT;
                    _this._errorObj.message = 'Please hang on...';
                    _this._errorObj.debugmessage = 'Server Injected reinit';

                    _this._sendErrorCallback(_this, true);
                }
            }), this);
        }
        return false;
    }


    return true;

    } catch(e) {core.error(e);}
}; // method _checkInjections


/**
 * Returns the value of a given tag no matter
 * in which data type we are in
 *
 * @param {string} whichTag The tag we want to extract
 * @return {mixed} The value of the tag
 */
core.ajax.prototype.getTag = function (whichTag)
{

    switch(this.db.p.typeGet)
    {
        case 'json':
            return this._getJson(whichTag);
            break;
        case 'xml':
            return this._getXml(whichTag);
            break;

    } //switch p.typeGet
}; //method getTag

/**
 * Return the recieved data object
 *
 * @return {mixed}
 */
core.ajax.prototype.getResult = function ()
{
    return this.db.result;
};

/**
* Returns the value of a tag within an xml result
* Assumes we have a single dimention resultset
*
* @private
* @param {string} whichTag The tag we want to extract
* @return {mixed} The value of the tag
*/
core.ajax.prototype._getXml = function (whichTag)
{
    try {
        var _out = this.db.result.getElementsByTagName(whichTag)[0].childNodes[0].nodeValue;
    }
    catch(e) {
        return '';
    }
    if (undefined === _out)
    {
        return '';
    }
    else {
        return _out;
    }

}; // method core.ajax.prototype._getXml

/**
 * Returns the value of a tag within a JSON object.
 * Assumes we have a single dimention resultset
 *
 * @private
 * @param {string} whichTag The tag we want to extract
 * @return {mixed} The value of the tag
 */
 core.ajax.prototype._getJson = function (whichTag)
{

    try {
        var _out = this.db.json[whichTag];
    }
    catch(e) {
        return '';
    }

    if (undefined === _out)
    {
        return '';
    }
    else {
        return _out;
    }

}; // method core.ajax.prototype._getJson

/**
 * Will Stop handling or error messages
 * by this class
 *
 * @return {void}
 */
core.ajax.prototype.stopErrorHandler = function()
{
    this._noErrorHandling = true;
}; // method core.ajax.stopErrorHandler

/**
 * Will append whatever given to the POST string
 *
 * @parm {string} what
 * @return {void}
 */
core.ajax.prototype.addRaw = function (what)
{
    this._passRaw += what;
}; //method addRaw

/**
 * Returns the ajax readyState
 *
 * @return {Number}
 */
core.ajax.prototype.getreadyState = function ()
{
    return this.ajax.readyState;
}; // method core.ajax.getreadyState

/**
 * Returns the ajax status
 *
 * @return {Number}
 */
core.ajax.prototype.getstatus = function ()
{
    return this.ajax.status;
}; // method core.ajax.getstatus

/**
 * Closes any open requests
 *
 * @return {void}
 */
core.ajax.prototype.close = function ()
{
    this.ajax.abort();
}; // method core.ajax.close

/**
 * Get error object
 *
 * @return {void}
 */
core.ajax.prototype.getError = function ()
{
    return this._errorObj;
}; // method core.ajax.getError


/**
 * Set that we have a file upload
 *
 * @param {boolean} what
 * @return {void}
 */
core.ajax.prototype.setFileUpload = function (what)
{
    this.db.isUpload = true;

}; // method core.ajax.setFileUpload



/**
* Compiles the passData object to a string
* or JSON object URI compatible
* for sending to the server
*
* @private
* @return {string}
*/
core.ajax.prototype._compilePassDataUpload = function ()
{
    try {
    var m = web;
    var g = goog;
    var log = core.log ('core.ajax._compilePassDataUpload');
    var geoc = core;

    log.fine('Init');

    // perform a few validations of data...
    if (!geoc.MOBILE) {
        log.severe('Upload methods are only for mobile devices');
        return {};
    }

    if (!this.db.hasData) {
        log.severe('No data have been passed to ajax class using .addData()');
        return {};
    }

    // init our return object
    var oReturn = {};

    var pho = geoc.copy(this.db.passData['spot_photo']);

    // loop through all the data in our class
    g.object.forEach(this.db.passData, function(item, index) {
        oReturn[index] = item;
        //log.shout('key:' + index + ' item type:' + g.typeOf(item));
    });

    oReturn['spot_photo'] = pho;


    //log.shout('file type:' + g.typeOf(oReturn['spot_photo']));
    //log.shout('file expose:' + g.debug.expose(oReturn['spot_photo']));
    //log.shout('file deepExpose:' + g.debug.deepExpose(oReturn['spot_photo']));
    //log.shout('file size:' + oReturn['spot_photo'].length);

    //add additional engine needed vars. If we are not in bare mode that is
    if (!this.db.p.bare)
    {
        oReturn['ajax'] =1; //set that we come from ajax submition

        oReturn['s'] = 'html'; // always html for uploads this.db.p.typeSend; //set the send type
        oReturn['g'] = this.db.p.typeGet; //set the get type

        //check if we have origin in the params
        if (g.isNumber(this.db.p.origin))
            oReturn['o'] = this.db.p.origin;


        // check if in mobile mode and add additional needed variables
        if ('t' == this.env) {
            // shortcut assign mc.db.device
            var dbdev = m.db.device;
            // add the application version
            oReturn['mob'] = m.db.APPVER;
            // append the two needed tokens
            oReturn['clientid'] =  m.net.db.session.clientid;
            oReturn['mobtoken'] = m.net.db.session.secrettoken;

        }
    } //if not in bare mode

    // no raw data supported in this mode

    return oReturn;
    } catch(e) {core.error(e);}
}; //method  core.ajax._compilePassDataUpload
