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
 * @copyright  (C) 2000-2010 Athanasios Polychronakis - All Rights Reserved
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
 * Handler for the keyUp event of the
 * chat textbox
 *
 * @param {object} event jQ event object
 * @return {boolean} true
 * @private
 */
web.ui.textCounter.prototype._keyUp = function(event)
{
  try {
    var j = $;
    var g = goog, ch = chat;
    var log = g.debug.Logger.getLogger('web.ui.textCounter._keyUp');
    //log.shout('init' + j(event.target).val());
    //console.debug(event);
    // set max chars for chat message
    var max = this.db.params.maxChars;

    // get length of message written
    var jEl = j(event.currentTarget);
    var text = jEl.val();
    var l = text.length;

    // This fixes a small bug
    // after user has submited a chat and remains focused
    // on the textfield, then when pressing a char the textfield remains
    // in 'unfocused' state...
    var iniTextLength = ch.data.initialTextChat.length;
    if (text.substr(0, iniTextLength) == ch.data.initialTextChat) {
      log.info('was in initial text, removing...');
      jEl.val(text.substr(-1)).removeClass("initial");
      l = 1;
    }



    // assign countercontainer
    var jqCount = this.db.params.jCount;

    // assign classes we will use
    var lev1 = 'chat_counter_lev1';
    var lev2 = 'chat_counter_lev2';
    var over = 'chat_counter_over';

    // remove all decorations
    jqCount.removeClass(lev1 + ' ' + lev2 + ' ' + over);

    // calculate difference from max chars limit
    var diff = max - l;

    log.finest('Init - length:' + l + ' diff:' + diff);

    // assign diff to container
    jqCount.text(diff);

    // check if we are in safe limits
    if (50 < diff) {
        return true;
    }

    // check if less than lev1 (30) but above lev2 (10)
    if (30 < diff) {
        jqCount.addClass(lev1);
        return true;
    }

    // check if between 0 and level 2
    if (0 <= diff) {
        jqCount.addClass(lev2);
        return true;
    } else {
        // rip string
        log.info('string over limit! excessive text:' + jEl.val().substr(max - 1));

        if (this.db.params.enforce)
          jEl.val(jEl.val().substr( 0 , max - 1));

        jqCount.addClass(over);
        return true;
    }


    return true;
  } catch(e){core.error(e);}
}; // web.ui.textCounter._keyUp

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
