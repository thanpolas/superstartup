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
 * createdate 08/Sep/2010
 *
 *********
 *  File:: user/profile.user.js
 *  Handler for user profile
 *********
 */




goog.provide('ss.user.profile');


/**
 * Account submition
 * We expect an object that has any of these keys:
 * nickname, email, userprivate[boolean]
 *
 * We execute the passed callback function with these params:
 * cb(status, opt_error_msg)
 * status is boolean
 * if false, we get error msg as well for user
 *
 * @param {object} datafields The data that we want to pass for submition
 * @param {Function} cb Callback Function
 * @return {boolean} Execution success / failure
 */
ss.user.profile.submitAccount = function (datafields, cb)
{
    //shortcut assignments
    var w = ss;
    var err = w.err;
    var u = w.user;
    var db = u.db;
    var g = goog;
    var genError = 'an error occured, please retry #222';
    var log = g.debug.Logger.getLogger('ss.user.profile.submitAccount');

    log.info('Init');



    // validate and check if data ok
    if (!u.profile._validateAccount(datafields)) {
        // not validated, call cb with false and error message...
        cb(false, err.get());
        return false;
    }

    /**
     * All is ok, submit the form
     *
     */
    //Parameters for AJAX
    var url='/userSettings/account';
    var params = {
        typeGet: 'json',
        typeSend: 'html',
        postMethod: 'POST'

    };

    // Initialise the object
    var a = new w.ajax(url, params);

    // check which fields we have and assign them to ajax class...
    if (g.isString(datafields.nickname))
        a.addData('nickname', datafields.nickname);

    if (g.isString(datafields.email))
        a.addData('email', datafields.email);

    if (g.isBoolean(datafields.userprivate))
        if (datafields.userprivate)
            a.addData('userprivate', '1');

    //callback function
    a.callback = function (result)
    {
        var user = a.getTag('user');
        if (!w.isNotEmpty(user)) {
            //no user object passed, error
            var msg = a.getTag('msg');
            log.warning('No user object passed. msg:' + msg);
            if (g.isString(msg))
                cb(false, msg);
            else
                cb(false, genError);
            return;
        }

        /**
         * we have collected objects succesfully, now overwrite user object
         *
         */
        db.user = {};
        db.user = user;
        // great, submited ok
        cb(true);
        return;
    }; //callback

    a.errorCallback = function ()
    {
        // failed...
        var errorobj = a.getError();
        cb(false, errorobj.message);
        return;
    }

    //perform the execution
    if (!a.send()) {
        log.warning('ajax send() failed!!');
        cb(false, genError);
        return false;
    }

    return true;

}; // method ss.user.profile.submitAccount

/**
 * We will validate the passed datafields object
 * We are called from .submitAccount()
 *
 * @private
 * @param {object} datafields
 * @return {boolean}
 */
ss.user.profile._validateAccount = function (datafields)
{
    //shortcut assignments
    var w = ss;
    var err = w.err;
    var u = w.user;
    var db = u.db;
    var g = goog;
    var log = g.debug.Logger.getLogger('ss.user.profile._validateAccount');

    log.info('Init');

    // switch to let us know if we had any field
    var gotone = false;

    //TODO [3b][4][08/Sep/2010] Create real validations using regex

    // check for nickname
    if (g.isString(datafields.nickname)) {
        // we have a nickname set, validate it...
        if (1 > datafields.nickname.length) {
            err('Nickname is very short');
            return false;
        }
        // nickname good
        gotone = true;
    } // if we have a nickname

    // check for email
    if (g.isString(datafields.email)) {
        // email set, check for size...
        if (4 > datafields.email.length) {
            if (0 == datafields.email.length) {
              err('Please enter your e-mail');
              return false;
            }
            err('E-mail is very short to be valid');
            return false;
        }
        // email good
        gotone = true;
    } // if we have email

    // check for user private
    if (g.isBoolean(datafields.userprivate)) {
        gotone = true;
    }

    if (!gotone) {
        err('You did not change any fields');
        return false;
    }

    // all ok
    return true;

}; // method ss.user.profile._validateAccount


/**
 * Password submition
 * We expect an object that has these keys:
 * passOld, passOne, passTwo
 *
 * We execute the passed callback function with these params:
 * cb(status, opt_error_msg)
 * status is boolean
 * if false, we get error msg as well for user
 *
 * @param {object} datafields The data that we want to pass for submition
 * @param {Function} cb Callback Function
 * @return {boolean} Execution success / failure
 */
ss.user.profile.submitPassword = function (datafields, cb)
{
    try {
    //shortcut assignments
    var w = ss;
    var err = w.err;
    var u = w.user;
    var db = u.db;
    var g = goog;
    var lang = w.lang.user;
    var genError = lang.errorGeneric;
    var log = g.debug.Logger.getLogger('ss.user.profile.submitPassword');

    log.info('Init');

    // validate and check if data ok
    if (!u.profile._validatePassword(datafields)) {
        // not validated, call cb with false and error message...
        cb(false, err.get());
        return false;
    }

    /**
     * All is ok, submit the form
     *
     */
    //Parameters for AJAX
    var url='/';
    var params = {
        typeGet: 'json',
        typeSend: 'html',
        postMethod: 'POST',
        origin: 107,
        oper: w.update.oper.user.editPass
    };

    // Initialise the object
    var a = new w.ajax(url, params);

    // add the required fields
    a.addData('old_password', datafields.passOld);
    a.addData('password1', datafields.passOne);
    a.addData('password2', datafields.passTwo);
    log.shout('datafields:' + g.debug.expose(datafields));
    //callback function
    a.callback = function (result)
    {
        // great, submited ok
        cb(true);
        return;
    }; //callback

    a.errorCallback = function ()
    {
        // failed...
        var errorobj = a.getError();
        cb(false, errorobj.message);
        return;
    }

    //perform the execution
    if (!a.send()) {
        log.warning('ajax send() failed!!');
        cb(false, genError);
        return false;
    }

    return true;

    } catch(e) {ss.error(e);}

}; // method ss.user.profile.submitPassword

/**
 * We will validate the passed datafields object
 * We are called from .submitPassword()
 *
 * @private
 * @param {object} datafields
 * @return {boolean}
 */
ss.user.profile._validatePassword = function (datafields)
{
    //shortcut assignments
    var w = ss;
    var err = w.err;
    var u = w.user;
    var db = u.db;
    var g = goog;
    var l = w.lang.user;
    var log = g.debug.Logger.getLogger('ss.user.profile._validatePassword');

    log.info('Init');


    /**
     * PASSWORD Validation
     */
    var d = datafields;

    // check for fields existance...
    if (!g.isString(d.passOld)) {
        err(l.register.no_password);
        return false;
    }
    if (!g.isString(d.passOne)) {
        err(l.register.no_password);
        return false;
    }
    if (!g.isString(d.passTwo)) {
        err(l.register.no_password);
        return false;
    }

    // check if the two passwords match
    if (d.passOne != d.passTwo) {
        err('Passwords do not match!');
        return false;
    }

    // TODO [3b][2][10/Sep/2010] Add password string length validations (hi/lo)


    // all ok
    return true;

}; // method ss.user.profile._validatePassword




/**
 * Profile submition
 *
 *  We execute the passed callback function with these params:
 * cb(status, opt_error_msg)
 * status is boolean
 * if false, we get error msg as well for user
 *
 * @param {object} datafields The required data fields
 * @param {Function} cb Callback function
 * @return {void}
 */
ss.user.profile.submitProfile = function (datafields, cb)
{
  try {
    //shortcut assignments
    var c = ss;
    var err = c.err;
    var u = c.user;
    var db = u.db;
    var g = goog;
    var genError = 'an error occured, please retry #223';
    var log = g.debug.Logger.getLogger('ss.user.profile.submitProfile');

    log.info('Init');



    /**
     * All is ok, submit the form
     *
     */
    //Parameters for AJAX
    var url='/userSettings/profile';
    var params = {
        typeGet: 'json',
        typeSend: 'html',
        postMethod: 'POST'

    };

    // Initialise the object
    var a = new c.ajax(url, params);

    // assign them to ajax class...

    a.addData('fullname', datafields.fullname);
    a.addData('location', datafields.location);
    a.addData('web', datafields.web);
    a.addData('bio', datafields.bio);

    //callback function
    a.callback = function (result)
    {
        var user = a.getTag('user');
        if (!c.isNotEmpty(user)) {
            //no user object passed, error
            var msg = a.getTag('msg');
            log.warning('No user object passed. msg:' + msg);
            if (g.isString(msg))
                cb(false, msg);
            else
                cb(false, genError);
            return;
        }

        /**
         * we have collected objects succesfully, now overwrite user object
         *
         */
        db.user = {};
        db.user = user;
        // great, submited ok
        cb(true);
        return;
    }; //callback

    a.errorCallback = function ()
    {
        // failed...
        var errorobj = a.getError();
        cb(false, errorobj.message);
        return;
    }

    //perform the execution
    if (!a.send()) {
        log.warning('ajax send() failed!!');
        cb(false, genError);
        return;
    }

    return;



  } catch (e) {
    ss.error(e);
  }

}; // ss.user.profile.submitProfile


/**
 * email Alerts submition
 * We expect an object that has these keys, all boolean:
 * mentions, frameComments, messages
 *
 * We execute the passed callback function with these params:
 * cb(status, opt_error_msg)
 * status is boolean
 * if false, we get error msg as well for user
 *
 * @param {object} datafields The data that we want to pass for submition
 * @param {Function} cb Callback Function
 * @return {boolean} Execution success / failure
 */
ss.user.profile.submitAlerts = function (datafields, cb)
{
    //shortcut assignments
    var w = ss;
    var err = w.err;
    var u = w.user;
    var db = u.db;
    var g = goog;
    var genError = 'an error occured, please retry #229';
    var log = g.debug.Logger.getLogger('ss.user.profile.submitAlerts');

    log.info('Init');


    /**
     * All is ok, submit the form
     *
     */
    //Parameters for AJAX
    var url='/userSettings/alerts';
    var params = {
        typeGet: 'json',
        typeSend: 'html',
        postMethod: 'POST'

    };

    // Initialise the object
    var a = new w.ajax(url, params);

    a.addData('mentions', (datafields.mentions ? 1 : 0));
    a.addData('frameComments', (datafields.frameComments ? 1 : 0));
    a.addData('messages', (datafields.messages ? 1 : 0));

    //callback function
    a.callback = function (result)
    {
        var user = a.getTag('user');
        if (!w.isNotEmpty(user)) {
            //no user object passed, error
            var msg = a.getTag('msg');
            log.warning('No user object passed. msg:' + msg);
            if (g.isString(msg))
                cb(false, msg);
            else
                cb(false, genError);
            return;
        }

        /**
         * we have collected objects succesfully, now overwrite user object
         *
         */
        db.user = {};
        db.user = user;
        // great, submited ok
        cb(true);
        return;
    }; //callback

    a.errorCallback = function ()
    {
        // failed...
        var errorobj = a.getError();
        cb(false, errorobj.message);
        return;
    }

    //perform the execution
    if (!a.send()) {
        log.warning('ajax send() failed!!');
        cb(false, genError);
        return false;
    }

    return true;

}; // method ss.user.profile.submitAlerts

