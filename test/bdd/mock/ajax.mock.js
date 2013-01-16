goog.provide('ssd.test.mock.ajax');


/**
 *
 *
 * typeGet :: TEXT, JSON - default JSON
 * postMethod :: POST, GET - default POST
 *
 * @param {string} url The URL we will contact for connection
 * @param {Object=} opt_params the parameters for the AJAX execution
 * @constructor
 * @return {this}
 */
ssd.test.mock.ajax = function(url, opt_params)
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

};

/**
 * Add data to send
 *
 * @param  {[type]} data [description]
 * @return {void}
 */
ssd.test.mock.ajax.prototype.data = function(data)
{
  this.p.data = data;
};

/**
 * Perform the actual send
 *
 * @param  {${2:Function}} fn [description]
 * @return {void}
 */
ssd.test.mock.ajax.prototype.send = function(fn)
{
  this.fn = fn;
};
