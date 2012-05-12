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

var sws = showcase.widget.showObject;


/**
 * The widget's constructor
 *
 * @constructor
 * @return {this}
 */
sws = function() {
  
  
  
  this.objectItems = [];
  
  
  
  
  return this;
};

/**
 * A class that contains our objectItem structure
 *
 * @constructor
 * @return {object}
 */
sws.objectItem = function() {
  return {
    id: '',
    title: '',
    comboTitle: '',
    objectPath: '',
    objectActual: {}
  }

};

/**
 * Add an object to the widget
 * 
 * @param {string} id A unique identifier to be used for handling objects
 * @param {string} title Title to use when the object is selected
 * @param {string} path The path where the object lives e.g. showcase.user.dataobject
 *                pass as a string
 * @param {string=} opt_comboTitle The title to use in the combo box if different from title
 * @return {this}
 */
sws.prototype.addObject = function(id, title, path, opt_comboTitle) {
  var obj = new sws.objectItem();
  obj.id = id;
  obj.title = title;
  obj.comboTitle = opt_comboTitle || title;
  obj.objectPath = path;
  this.objectItems.push(obj);
  return this;
};

/**
 * Populate our combobox
 * 
 * @return {this}
 */
sws.prototype.populate = function() {
  
};






