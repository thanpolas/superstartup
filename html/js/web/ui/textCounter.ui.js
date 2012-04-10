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
 *
 *
 *
 *********
 * created on Jun 28, 2011
 * textCounter.ui.js.js [File Description]
 *
 */


goog.provide('web.ui.textCounter');

/**
 * A class for counting typed chars on a textbox / textarea
 *
 * params = {
 *    jText: {jQuery} textfield
 *    jCount: {jQuery} element we will output counter
 *    maxChars: {Number} maximum characters allowed
 *    enforce: {boolean=} If we want to enforce (default yes)
 *
 * }
 *
 *
 * @param {object} params object containing keys described above...
 * @constructor
 * @return {this}
 */
web.ui.textCounter = function(params)
{
  try {
    var g = goog;

    // prepare the parameters
    if (!g.isDef(params.enforce))
      params.enforce = true;


    this.db = {
      params: params
    }



    // start binding events
    params.jText.keyup(g.bind(this._keyUp, this));

  } catch (e) {
    core.error(e);
  }


};


/**
 * Reset counter and empty text field
 *
 * @return {void}
 */
web.ui.textCounter.prototype.reset = function()
{
  try {
    this.db.params.jCount.text(this.db.params.maxChars);
    this.db.params.jText.val('');
  } catch (e) {
    core.error(e);
  }

};
