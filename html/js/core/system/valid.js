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
 * @createdate 25/May/2011
 *
 *********
 *  File:: system/valid.js
 *  Core validation functions file
 *********
 */


goog.provide('core.valid');


/**
 * Here we will store an array of bad password strings.
 * We ban certain very weak passwords from use
 */
core.valid.badPasswords = false;

/**
 * Checks a nickname against proper characters
 * and string length
 * we allow a-zA-Z0-9 _-.^[]|
 *
 * @param {string} string the nickname
 * @param {boolean} what [optional] if set to true we will return the illegal character
 */
core.valid.checkNick = function (string) {

    var err = core.err;

    if (!goog.isString(string)) {
        err('No nickname was entered');
        return false;
    }

    //prepare reg ex
    var lim = core.conf.userLengthLimits;
    var reg = '^[\\\w\\\d\\\_\\\-]{';
    reg += lim.nick_lo + "," + lim.nick_hi;
    reg += "}$";
    var r = new RegExp(reg, 'gi');


    //make the comparison
    if (-1 == string.search(r)) {
        err('Nickname not valid, please only use latin characters and numbers');
        return false;
    }

    return true;
}; // method checkNick




/**
 * Validates a Full Name string
 * We allow A-Za-z space and -
 *
 * @param {string} string
 * @return boolean
 */
core.valid.checkFullName = function (string)
{
    if (-1 == string.search(/^[a-zA-Z -]+$/)) {
        core.err(core.lang.user.register.valid_fname);
        return false;
    }
    return true;
}; // method core.valid.checkFullName


/**
 * Validates a password
 * We check if password is 6 chars or more
 * and we check against weak passwords
 *
 * @param {string} string The password
 * @return boolean
 */
core.valid.checkPass = function (string)
{
    //check for small password length
    if (string.length < core.conf.userLengthLimits.pass_lo) {
        core.err(core.lang.user.register.password_min);
        return false;
    }

    //check for max password length
    if (string.length > core.conf.userLengthLimits.pass_hi) {
        core.err(core.lang.user.register.password_max);
        return false;
    }

    //check if we have badPasswords loaded and check against them
    if (goog.isArray(core.valid.badPasswords)) {
        if(-1 < jQuery.inArray(string, core.valid.badPasswords)) {
            //password is weak
            core.err(core.lang.user.register.pass_weak);
            return false;
        }
    }
    return true;
}; // method core.valid.checkPass


/**
 * E-mail Validation
 * We expect an array that contains the element 'email'.
 *
 * regexp from:
 * http://regexlib.com/Search.aspx?k=&c=1&m=5&ps=20
 *
 * We will check:
 * - if string is string type
 * - String evaluates as an email
 * - Email already exists in our DB
 *
 * @param {string} string The email
 * @return boolean
 */
core.valid.checkEmail = function (string)
{
    var err = core.err;
    var lang = core.lang.user;

    if (!goog.isString(string)) {
        err('No email has been entered. Please retry');
        return false;
    }

    //check if string within character length limits
    var len = string.length;
    var lim = core.conf.userLengthLimits;
    if (lim.email_lo >  len || lim.email_hi < len) {
        err('The e-mail you entered is not valid');
        return false;
    }

    //perform string check
    if (-1 == string.search(/^[A-Za-z0-9](([_\.\-]?[a-zA-Z0-9]+)*)@([A-Za-z0-9]+)(([\.\-]?[a-zA-Z0-9]+)*)\.([A-Za-z]{2,})$/gi)) {
        err('The e-mail you entered is not valid');
        return false;
    }


    return true;

}; // method CheckEmail


