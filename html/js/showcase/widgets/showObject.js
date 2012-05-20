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
 *
 *
 *
 *********
 * A widget that can display any data object that it is provided with
 *
 */

goog.provide('showcase.widget.showObject');
goog.require('goog.debug');


/**
 * The widget's constructor
 * 
 * Parameters are:
 *  comboBox: {jQuery|string} jQuery element or selector
 *  displayBox: {jQuery|string} jQuery element or selector for displaying results
 *
 *
 *
 * @param {Object=} opt_params a hash containing configuration options as defined
 *          in the description above
 * @constructor
 * @return {this}
 */
showcase.widget.showObject = function(opt_params) {
  /**
   * @private
   * @type {?Object} Contains our jQuery elements to bind on
   */
  this._params = opt_params || null;
  
  /**
   * @private
   * @type {jQuery} Will contain the content we'll inject in the displayBox element
   */
  this._jContent = jQuery();
  
  /**
   * @private
   * @type {boolean} Know if we have binded events
   */
  this._eventsBinded = false;
  
  return this;
};

/**
 * private container of object items
 *
 * @type {Array}
 * @private
 */
showcase.widget.showObject.prototype._objectItems = [];

/**
 * A class that contains our objectItem structure
 *
 * @constructor
 * @private
 * @return {object}
 */
showcase.widget.showObject.objectItem = function() {
  return {
    'itemId': '',
    title: '',
    comboTitle: '',
    objectPath: '',
    item: null,
    def: false,
    objectActual: {}
  }

};

/**
 * Add an object to the widget
 * 
 * @param {string} id A unique identifier to be used for handling objects
 * @param {string} title Title to use when the object is selected
 * @param {string} path Literal name of mixed. The path where the object, 
 *      array or whatever lives e.g. showcase.user.dataobject pass as a string
 * @param {*} item The actual data object. Can be any type, if funcion we will
 *      execute it
 * @param {boolean=} opt_default If we want this object to render first
 * @param {string=} opt_comboTitle The title to use in the combo box if different from title
 * @return {this}
 */
showcase.widget.showObject.prototype.addObject = function(id, title, path, item, opt_default, opt_comboTitle) {
  var obj = new showcase.widget.showObject.objectItem();
  obj['itemId'] = id;
  obj.title = title;
  obj.comboTitle = opt_comboTitle || title;
  obj.objectPath = path;
  obj.item = item;
  obj.def = opt_default || false;
  this._objectItems.push(obj);
  return this;
};

/**
 * Renders required elements and populates them
 * 
 * @return {this} if we don't validate
 */
showcase.widget.showObject.prototype.render = function() {
  // validate parameters, reset our containers and populate the combo box
  // if we haven't binded events
  if (!this._eventsBinded)
    this._validate().reset().populateCombo()._bindEvents();
  
  // Now show the selected object
  var itemId = this._params.comboBox.val();
  var item = ss.arFind(this._objectItems, 'itemId', itemId);
  this._renderItem(item);
  
  return this;
};

/**
 * Render proper elements and inject into DOM showing the
 * object or whatever var we got...
 *
 * @private
 * @param {showcase.widget.showObject.objectItem} item
 * @return {this}
 */
showcase.widget.showObject.prototype._renderItem = function(item) {
  var g = goog;
  this._jContent.children('h3').text(item.title);
  this._jContent.children('span').html('<b>Name literal:</b> <i>' + item.objectPath + '</i>');
  var objItem = null;
  if (g.isFunction(item.item))
    objItem = item.item();
  else
    objItem = item.item;
  this._jContent.children('pre').text(g.debug.deepExpose(objItem, false, true));
  this._params.displayBox.html(this._jContent);
  
  return this;
  
  
};



/**
 * Populate combo Box with data
 *
 * @return {this}
 */
showcase.widget.showObject.prototype.populateCombo = function () {
  try {
    var c = this._params.comboBox, newOption;
    $.each(this._objectItems, function(index, item) {
      newOption = '<option' + (item.def ? ' selected' : '') + ' value="' + item['itemId'] + '">' + item.comboTitle + '</option>';
      c.append(newOption);
    });
    return this;
  } catch(e) {ss.error(e);}
};

/**
 * Resets the contents of our elements
 *
 * @return {this}
 */
showcase.widget.showObject.prototype.reset = function () {
  this._params.comboBox.empty();
  this._params.displayBox.html('');
  this._jContent = jQuery(showcase.widget.showObject.template());
  return this;
};

/**
 * Perform validation on given parameters
 * @private
 * @return {this}
 */
showcase.widget.showObject.prototype._validate = function() {
  var w = window, g = goog, s = ss, j = $;

  if (g.isNull(this._params))
    throw new TypeError('Parameters not defined. Please set proper elements');
  
  // check if we have jQuery objects, if not try to create
  // them, and in the end see if we have 1 selected element...
  var jQurator = function(mixed, name) {
    if (!s.isjQ(mixed))
      if(!g.isString(mixed))
        throw new TypeError(name + ' parameter not defined');
      else
        mixed = j(mixed);
    if (1 != mixed.length)
      throw new Error(name + ' selector does not have one (1) element selected. It has:' + mixed.length + ' Selector:' + mixed.selector);
    
  };
  jQurator(this._params.comboBox, 'comboBox');
  jQurator(this._params.displayBox, 'displayBox');
  
  // make sure comboBox IS a combo box
  if ('SELECT' != this._params.comboBox[0].tagName)
    throw new Error('comboBox is NOT a combo box. Type of element:' + this._params.comboBox[0].tagName);
  
  return this;

};

/**
 * Bind on combobox change events
 *
 * @private
 * @return {this}
 */
showcase.widget.showObject.prototype._bindEvents = function () {
  if (this._eventsBinded)
    return;
  this._eventsBinded = true;
  var t = this;
  this._params.comboBox.change(function(e){
    t.render();
  });
  return this;
};


/**
 * A micro template to use to output oura data objects properly
 * in our container
 *
 * @return {string}
 */
showcase.widget.showObject.template = function() {
  return '<div style="overflow:auto; border:1px solid #BBB; width: 500px;height:300px;">'
    + '<h3></h3><br />'
    + '<span></span><br />'
    + '<pre></pre>'    
    + '</div>';
};






