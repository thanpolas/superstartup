/**
 * Copyright 2000-2011 Athanasios Polychronakis. Some Rights Reserved.
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
goog.provide('ssd.ajax');

/**
 * We will implement jQuery's ajax object
 *
 * typeGet :: TEXT, JSON - default JSON
 * postMethod :: POST, GET - default POST
 *
 * @param {string} url The URL we will contact for connection
 * @param {Object=} opt_params the parameters for the AJAX execution
 * @constructor
 * @return {this}
 */
ssd.ajax = function(url, opt_params)
{
  /**
   * @private
   * @type {Object} params passed
   */
  this.p = opt_params || {};
  /**
   * @private
   * @type {string} url to post to
   */
  this.url = url;

  this.logger.config('Init. url:' + url);
  return this;
};

/**
 * Send methods
 * @enum {string}
 */
ssd.ajax.sendMethods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT'
};

/**
 * A logger to help debugging
 * @type {goog.debug.Logger}
 * @private
 */
ssd.ajax.prototype.logger = goog.debug.Logger.getLogger('ssd.ajax');

/**
 * @private
 * @type {Object} Store all data to pass
 */
ssd.ajax.prototype._dataPass = {};

/**
 * Overwrite to get a callback
 *
 * @protected
 */
ssd.ajax.prototype.callback = function(){};

/**
 * Overwrite to get a callback for request fail
 *
 * @protected
 */
ssd.ajax.prototype.errorCallback = function(){};

/**
 * Get the error message
 *
 * @return {string}
 */
ssd.ajax.prototype.getError = function()
{
  return this._errorMsg;
};

/**
 * @private
 * @type {string}
 */
ssd.ajax.prototype._errorMsg;

/**
 *
 * @param {jQuery.jqXHR} jqXHR
 * @param {string} textStatus
 * @param {string} errorThrown
 */
ssd.ajax.prototype._handleError = function(jqXHR, textStatus, errorThrown)
{
  this._errorMsg = textStatus + ' ' + errorThrown;
  this.errorCallback(this._errorMsg);
};

/**
 * Handle the success callback
 * @private
 * @param {*} data
 * @param {string} textStatus
 * @param {jQuery.jqXHR} jqXHR
 * @return {void}
 */
ssd.ajax.prototype._handleSuccess = function(data, textStatus, jqXHR)
{
  this.callback(data);
};

/**
 * Add data to send
 *
 * @param {string} key The key of the data to be added
 * @param {mixed} value The value we need to store
 * @return {void}
 */
ssd.ajax.prototype.addData = function(key, value)
{
  this._dataPass[key] = value;
};

/**
 * Perform the actual send
 *
 * @return {void}
 */
ssd.ajax.prototype.send = function()
{
  if (!jQuery) {
    throw new Error('We require jQuery for ssd.ajax class');
  }
  this.logger.config('Sending. data:' + goog.debug.expose(this._dataPass));
  jQuery.ajax(this.url, {
    type: this.p.postMethod || 'POST',
    data: this._dataPass,
    dataType: this.p.typeGet || 'json',
    cache: false,
    global: false,
    success: goog.bind(this._handleSuccess, this),
    error: goog.bind(this._handleError, this)
  });
};
