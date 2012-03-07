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
* Web UI alert file (the messaging box)
* createdate 25/May/2011
*
*/

goog.provide('web.ui.alert');



/**
 * This will hold the setTimeout Id of the alert message box in an array
 * of type:
 * [{timeoutId: jq.selector, timeout: setTimeoutId}, {...}]
 *
 *
 * @private
 * @type array
 */
web.ui._alertTimers = new Array();


/**
 * Will display the main messagebox warning window.
 * Values for type:
 *  error :: Error message
 *  warning :: A warning message
 *  info :: Informational message
 *  success :: An operation completed succesfully type of message
 *
 * @param {string} msg The message you want to output
 * @param {string=} opt_type The type of the alert
 * @param {jQuery=} opt_jqel jQuery Element we want to apply the alert to
 * @return {void}
 */
web.ui.alert = function (msg, opt_type, opt_jqel)
{
    var w = web;
    var c = core;
    var ui = w.ui;
    var g = goog;
    var j = $;
    var log = g.debug.Logger.getLogger('web.ui.alert');

    var type = opt_type || 'error';

    // set jq (master) element we will be managing
    var jqMast = opt_jqel || j("#master_alert");

    if (!c.isjQ(jqMast)) {
    	log.severe('Cannot locate master element:' + jsMast);
    	return;
    }
    // set the jq content main of the message box
    var jq = jqMast.find(".alert_box");

    // set opacity
    jqMast.css('opacity', 0.92);

    if (!c.isjQ(jq)) {
        log.severe('jQuery element is not set. The opt_jqel is probably wrong:' + opt_jqel.selector);
        log.severe('jq selector:' + jq.selector);
        log.severe('typeof jq:' + g.typeOf(jq));
        return;
    }
    log.info('Init - type:' + type + ' jq length:' + jq.length + ' jQselector:' + jqMast.selector + ' msg:' + msg);

    //check if the alert is already On
    if (jqMast.on())
    {
        log.fine('Alert Box is On');
        //it is ON, append a new message and reset the timeout
        // for closing the message box



        //we will reset the timer now, find the index of our timeout...
        //* [{timeoutId: jq.selector, timeout: setTimeoutId}, {...}]
        var ind = c.arFindIndex(ui._alertTimers, 'timeoutId', jqMast.selector);
        if (-1 == ind) {
            log.severe('Could not find selector:' + jqMast.selector
                + ' in web.ui._alertTimers:' + g.debug.deepExpose(ui._alertTimers));
            return false;
        }
        log.finer('found selector, ind:' + ind);

        // check if we are a staticBox
        if (ui._alertTimers[ind].staticBox) {
            // cleanup all messages
            jq.empty();
        } else {
            // clear the timeout now
            clearTimeout(ui._alertTimers[ind].timeout);

            //and create a new one...
            ui._alertTimers[ind].timeout = setTimeout(function() {
                log.fine('[many] closing alert box:' + jqMast.selector);
                jqMast.slide();
            }, c.conf.root.timeNoticeClose);
        }
        // append the message
        appendMsg();
        // that's it
        return;




        /*
        if (!pe.msgbox.mainParts.pulsating)
        {
            //and a little effect to warn user that a new message appeared
            pe.msgbox.mainParts.pulsating = true;
            jq.effect('pulsate', {}, 500,
                function() {
                    pe.msgbox.mainParts.pulsating = false;
                    $(this).css("opacity", 0.9);
            });
        }
        */
    } // if alert box is already on
    else
    {
        log.fine('Alert box is Off');
        // cleanup all messages
        jq.empty();

        // check if this selector has ever been called before...
        var ind = c.arFindIndex(ui._alertTimers, 'timeoutId', jqMast.selector);
        if (-1 == ind) {
            // first time we meet this fellow...
            // create a dummy record
            log.fine('First Time, creating a dummy record for:' + jqMast.selector);
            ui._alertTimers.push({
                timeoutId: jqMast.selector,
                timeout: {}
            });
            var ind = c.arFindIndex(ui._alertTimers, 'timeoutId', jqMast.selector);
        }

        // append the message
        appendMsg();

        // slide open the message box
        jqMast.slide(function () {
            // check if we are a not in a static message box
            if (!ui._alertTimers[ind].staticBox) {
                // set the timeout to close back the message box
                // clean any leftover timers just to be sure...
                clearTimeout(ui._alertTimers[ind].timeout);
                ui._alertTimers[ind].timeout = setTimeout(function() {
                    log.fine('closing alert box:' + jqMast.selector);
                    jqMast.slide();
                }, c.conf.root.timeNoticeClose);
            }
        });
    }

    /**
     * Append a message to our jq container...
     *
     * @private
     * @return {void}
     */
    function appendMsg()
    {
        // get new message template
        var jmsg = j('<div class="alert_box_cont_main">'
        	    + '<span class="alert_box_cont_img ui-icon"></span>'
        	    + '<span class="alert_box_cont_msg"></span>'
        	    + '</div>');

        // get proper css classes
        var c = getClasses(type);
        // apply decorations
        jmsg.addClass(c.colorClass);

        // check for inline
        if (ui._alertTimers[ind].inline)
            jmsg.addClass('alert_box_cont_main_inline');

        jmsg.children('.alert_box_cont_img').addClass(c.iconClass);

        // add the message now...
        jmsg.children('.alert_box_cont_msg').html(msg);


        // append the msg container to the DOM
        jq.append(jmsg);
    } // function appendMsg

    /**
     * Will return the proper class for the
     * container color/background and icon
     * in an object with two items:
     * c.colorClass{string}
     * c.iconClass{string}
     *
     * @private
     * @return {Object} c.colorClass{string}, c.iconClass{string}
     */
    function getClasses(type)
    {
        var ret = {
            colorClass: '',
            iconClass: ''

        };
        switch(type) {
            case 'error':
                ret.colorClass = 'alert_error';
                ret.iconClass = 'ui-icon-circle-close';
                break;
            case 'info':
                ret.colorClass = 'alert_info';
                ret.iconClass = 'ui-icon-info';
                break;
            case 'success':
                ret.colorClass = 'alert_success';
                ret.iconClass = 'ui-icon-circle-check';
                break;
            case 'warning':
                ret.colorClass = 'alert_warning';
                ret.iconClass = 'ui-icon-alert';
                break;
        }

        return ret;
    } // function getClasses

}; // method web.ui.alert

/**
 * Will configure a specific alert container
 *
 * opts: {
 *  staticBox: false // if we need the alert box to be static, no autoclosing
 *  inline: false // apply inline decorations. No white bg, text wraps to outbound width
 * }
 *
 * @param {jQuery} jQel
 * @param {Object} opts Options
 * @return {void}
 */
web.ui.alertConf = function(jQel, opts)
{
    var w = web;
    var c = core;
    var ui = w.ui;
    var g = goog;

    var staticBox = opts.staticBox || false;
    var inline = opts.inline || false;


    var ind = c.arFindIndex(ui._alertTimers, 'timeoutId', jQel.selector);
    if (-1 == ind) {
        // first time we meet this fellow...
        // create a dummy record
        ui._alertTimers.push({
                timeoutId: jQel.selector,
                timeout: {},
                staticBox: staticBox,
                inline: inline
        });
    } else {
        ui._alertTimers[ind].staticBox = staticBox;
    }

    // perform decorations based on options
    if (staticBox) {
        jQel.addClass('alert_box_master_static');
    }

    if (inline) {
        jQel.addClass('alert_box_master_inline');
    }
};

/**
 * Will force close the alert of selector
 *
 * @param {string} selector DOM ID
 * @return {void}
 */
web.ui.alertClose = function (selector)
{
    var w = web;
    var c = core;
    var ui = w.ui;
    var pe = w.pe;
    var g = goog;
    var j = $;
    var log = g.debug.Logger.getLogger('web.ui.alertClose');

    if (!g.isString(selector)) {
        log.severe('alertClose:: selector is not a string:' + selector);
        return;
    }
    selector = '#' + selector;

    log.info('Init - selector:' + selector);

    var ind = c.arFindIndex(ui._alertTimers, 'timeoutId', selector);
    if (-1 == ind) {
        log.severe('alertClose:: Could not find selector:' + selector
                + ' in web.ui._alertTimers:' + g.debug.deepExpose(ui._alertTimers));
        return false;
    }
    if (j(selector).off()) return; // nothing todo

    // clear the timeout...
    clearTimeout(ui._alertTimers[ind].timeout);
    // slide up...
    j(selector).slide();
}; // method web.ui.alertClose
