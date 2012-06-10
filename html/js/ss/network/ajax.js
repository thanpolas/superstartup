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
goog.provide('ss.ajax');

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
ss.ajax = function(url, opt_params)
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
  return this;
};

/**
 * @private
 * @type {Array} Store all data to pass
 */
ss.ajax.prototype._dataPass = [];

/**
 * Overwrite to get a callback
 *
 * @protected
 */
ss.ajax.prototype.callback = function(){};

/**
 * Overwrite to get a callback for request fail
 *
 * @protected
 */
ss.ajax.prototype.errorCallback = function(){};

/**
 * Get the error message
 *
 * @return {string}
 */
ss.ajax.prototype.getError = function()
{
  return this._errorMsg;
};

/**
 * @private 
 * @type {string} 
 */
ss.ajax.prototype._errorMsg;

/**
 * 
 * @param {jQuery.jqXHR} jqXHR
 * @param {string} textStatus
 * @param {string} errorThrown
 */
ss.ajax.prototype._handleError = function(jqXHR, textStatus, errorThrown)
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
ss.ajax.prototype._handleSuccess = function(data, textStatus, jqXHR)
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
ss.ajax.prototype.addData = function(key, value)
{
  this._dataPass[key] = value;
};

/**
 * Perform the actual send
 * 
 * @return {void}
 */
ss.ajax.prototype.send = function()
{
  if (!jQuery) {
    throw new Error('We require jQuery for ss.ajax class');
  }
  
  jQuery.ajax(this.url, {
    type: this.p.postMethod || 'POST',
    data: this._dataPass,
    dataType: this.p.typeGet || 'JSON',
    success: goog.bind(this._handleSuccess, this),
    error: goog.bind(this._handleError, this)
  });
};
