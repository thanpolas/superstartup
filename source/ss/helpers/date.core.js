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
 * createdate 05/Jul/2010
 *
 *********
 *  File:: utilities/date.ssd.js
 *  Generic date class. Used for formating
 *********
 */


goog.provide('ssd.date');

goog.require('goog.date');
goog.require('goog.date.DateTime');


/**
 * The date constructor
 *
 * We expect a string of RFC822 type: Wed, 26 May 2010 23:17:17 +0000
 *
 * Or a typical MySQL Data string: 2010-06-09 13:12:01
 *
 * If no parameter is set we use now datetime
 *
 * @param {string=} opt_sdate date RFC822 type: Wed, 26 May 2010 23:17:17 +0000 - or 2010-06-09 13:12:01
 * @return {this}
 * @constructor
 */
ssd.date = function (opt_sDate)
{
    var logger = goog.debug.Logger.getLogger('ssd.date');

    logger.fine('Init - sDate:' + opt_sDate);



    this.db = {
        sDate: opt_sDate || null, // the string date as passed from parameters
        gdt: {}, // the google date instance
        // get current date time
        gdtnow: new goog.date.DateTime()
    }

    if (goog.isString(opt_sDate)) {
        // execute method to fill our date data object (this.db.dt)
        //Wed, 02 Oct 2002 15:00:00 +0200
        this.db.gdt = goog.date.DateTime.fromRfc822String(opt_sDate);

        // check if the string validated ...
        if (goog.isNull(this.db.gdt)) {
          // no it didn't, let's try a normal MySQL string

          // try another way that'll work as well...
          this.db.gdt = new goog.date.fromIsoString(opt_sDate);
        }

    } else {
        this.db.gdt = new goog.date.DateTime();
    }

    // check if gdt is set
    if (goog.isNull(this.db.gdt)) {
        // not set, use now
        this.db.gdt = new goog.date.DateTime();
    }

    return this;
}

ssd.date.dbstatic = {
    day: {
        0: 'Sun',
        1: 'Mon',
        2: 'Tue',
        3: 'Wed',
        4: 'Thu',
        5: 'Fri',
        6: 'Sat'
    },
    month: {
        0: 'Jan',
        1: 'Feb',
        2: 'Mar',
        3: 'Apr',
        4: 'May',
        5: 'Jun',
        6: 'Jul',
        7: 'Aug',
        8: 'Sep',
        9: 'Oct',
        10: 'Nov',
        11: 'Dec'
    },
    monthRev: {
        'Jan' : 0,
        'Feb' : 1,
        'Mar' : 2,
        'Apr' : 3,
        'May' : 4,
        'Jun' : 5,
        'Jul' : 6,
        'Aug' : 7,
        'Sep' : 8,
        'Oct' : 9,
        'Nov' : 10,
        'Dec' : 11
    }
}; // property ssd.date.db


/**
 * Get time difference in a string format in ago type
 * e.g. 1 minute ago, 2 days ago, etc...
 *
 * @param {boolean} opt_short If we need a shorter version define true
 * @return {string}
 */
ssd.date.prototype.getDiffStringAgo = function (opt_short)
{
    var diff = ssd.date.getDiffSecs(this.db.gdt);

    // more than a day ago
    if (86400 < diff ) return this.smallDate();


    if (60 > diff) return diff + ( opt_short ? 'secs' : ' seconds ago');
    if (120 > diff) return ( opt_short ? '1 min' : 'about a minute ago');
    if (3600 > diff) return ( opt_short ? Math.floor(diff / 60) + ' min' : 'about ' + Math.floor(diff / 60) + ' minutes ago');
    if (7200 > diff) return ( opt_short ? '1 hour' : 'about an hour ago');
    if (86400 >= diff) return ( opt_short ? Math.floor(diff / 3600) + ' hours' : 'about ' + Math.floor(diff / 3600) + ' hours ago');

    return '';
}; // method ssd.date.getDiffStringAgo

/**
 * A static function that calculates
 * the dirrence from the given google date
 * compared to now in seconds
 *
 * @param {goog.date.DateTime} gDate
 * @return {Number} seconds
 */
ssd.date.getDiffSecs = function (gDate)
{
  try {
    var g = goog;

    if (g.isNull(gDate))
      return 0;
    var dtnow = new g.date.DateTime();

    var epoch = Math.floor(gDate.getTime() / 1000);
    var epochnow = Math.floor(dtnow.getTime() / 1000);

    return Math.abs((epochnow - epoch));
  } catch(e) {ssd.error(e);}
};


/**
 * Will return the smallest possible data time
 * string. If within this year, we ommit year,
 * if same day we ommit month
 *
 * e.g. 12:32 PM May 25
 * 09:23 AM Dec 23, 2009
 */
ssd.date.prototype.smallDatetime = function ()
{
    var c = ssd;
    var g = goog;
    var m = c.date.dbstatic.month;
    var logger = g.debug.Logger.getLogger('ssd.date.smallDatetime');
    var sdate = this.db.sDate;
    logger.fine('Init');

    var d = this.db.gdt;

    // get current date time
    var n = this.db.gdtnow;


    // apply formatings, start with date
    var dd = g.string.buildString(d.getDate());
    if (1 == dd.length)
        dd = '0' + dd;
    // month
    var mm = g.string.buildString(d.getMonth());
    if (1 == mm.length)
        mm = '0' + mm;
    var mmm = m[d.getMonth()];
    // hours
    var hh = d.getHours();
    if (12 < hh) {
        hh = g.string.buildString(hh - 12);
        if (1 == hh.length)
            hh = '0' + hh;
        var a_p = 'pm';
    } else {
        hh = g.string.buildString(hh);
        if (1 == hh.length)
            hh = '0' + hh;
        var a_p = 'am';
    }
    // minutes
    var MM = g.string.buildString(d.getMinutes());
    if (1 == MM.length)
        MM = '0' + MM;


    // compare years...
    if (d.getYear() != n.getYear()) {
        // different year, display it as hh:MM mmm dd, yyyy
        var ret =  mmm + '/' + dd + '/' + d.getYear() + ' ' + hh + ':' + MM + '' + a_p;
        logger.finer('Year Orig:' + sdate + ' Formated:' + ret);
        return ret;
    }

    // check if not in same month
    if (d.getMonth() != n.getMonth()) {
        // different month, display it as hh:MM mmm dd
        var ret =  mmm + '/' + dd  + ' ' + hh + ':' + MM + '' + a_p;
        logger.finer('Month Orig:' + sdate + ' Formated:' + ret);
        return ret;
    }

    // check if in same day
    if (d.getDate() == n.getDate()) {
        // same day, display as hh:mm
        var ret = d.getHours() + ':' + MM + '' + a_p;
        logger.finer('Date same Orig:' + sdate + ' Formated:' + ret);
        return ret;

    }

    // different day, display it as dd mmm
    //var ret = d.toLocaleFormat('mmm'); //d.getDate() + ' ' + m[d.getMonth()];
    var ret = dd + '/' + mmm + ' ' + hh + ':' + MM + ' ' + a_p;



    logger.finer('Date Not same Orig:' + sdate + ' Formated:' + ret);
    return ret;

}; // method ssd.data.smallDatetime

/**
 * Returns a formated date in the shortest type.
 * E.g. 01:34 am, 4 Apr, 2009
 *
 *
 * @return {string|null} formated date or null if sdate does not validate
 */
ssd.date.prototype.smallDate = function ()
{
    var c = ssd;
    var g = goog;
    var m = c.date.dbstatic.month;
    var logger = g.debug.Logger.getLogger('ssd.date.smallDate');
    var sdate = this.db.sDate;
    logger.fine('Init:' + g.typeOf(this.db.gdt));

    var d = this.db.gdt;

    // get current date time
    var n = this.db.gdtnow;


    // apply formatings, start with date
    var dd = g.string.buildString(d.getDate());
    if (1 == dd.length)
        dd = '0' + dd;
    // month
    var mm = g.string.buildString(d.getMonth());
    if (1 == mm.length)
        mm = '0' + mm;
    var mmm = m[d.getMonth()];
    // hours
    var hh = d.getHours();
    if (12 < hh) {
        hh = g.string.buildString(hh - 12);
        if (1 == hh.length)
            hh = '0' + hh;
        var a_p = 'pm';
    } else {
        hh = g.string.buildString(hh);
        if (1 == hh.length)
            hh = '0' + hh;
        var a_p = 'am';
    }
    // minutes
    var MM = g.string.buildString(d.getMinutes());
    if (1 == MM.length)
        MM = '0' + MM;


    // compare years...
    if (d.getYear() != n.getYear()) {
        // different year, display it as mm/dd/yyyy
        var ret = mm + '/' + dd + '/' + d.getYear();
        logger.finer('Year Orig:' + sdate + ' Formated:' + ret);
        return ret;
    }

    // check if not in same month
    if (d.getMonth() != n.getMonth()) {
        // different month, display it as dd mmm
        var ret = mmm + ' ' + d.getDate();
        logger.finer('Month Orig:' + sdate + ' Formated:' + ret);
        return ret;
    }

    // check if in same day
    if (d.getDate() == n.getDate()) {
        // same day, display as hh:mm
        var ret = d.getHours() + ':' + MM + ' ' + a_p;
        logger.finer('Date same Orig:' + sdate + ' Formated:' + ret);
        return ret;

    }

    // different day, display it as dd mmm
    //var ret = d.toLocaleFormat('mmm'); //d.getDate() + ' ' + m[d.getMonth()];
    var ret = mmm + ' ' + d.getDate();
    logger.finer('Date Not same Orig:' + sdate + ' Formated:' + ret);
    return ret;


}; // method ssd.date.smallDate



/**
 * Get current date in RFC822 format: Wed, 26 May 2010 23:17:17 +0000
 *
 * @return {string} date RFC822 type: Wed, 26 May 2010 23:17:17 +0000
 * @constructor
 */
ssd.date.prototype.getRFC822 = function ()
{
    var c = ssd;
    var g = goog;
    var logger = g.debug.Logger.getLogger('ssd.date.getRFC822');

    // construct the string
    var ret = '';
    // get day
    ret += c.date.dbstatic.day[this.db.gdt.getDay()];
    ret += ', ';
    ret += this.db.gdt.getDate();
    ret += ' ';
    ret += c.date.dbstatic.month[this.db.gdt.getMonth()];
    ret += ' ';
    ret += this.db.gdt.getYear();
    ret += ' ';
    ret += this.db.gdt.getHours();
    ret += ':';
    ret += this.db.gdt.getMinutes();
    ret += ':';
    ret += this.db.gdt.getSeconds();
    ret += ' ';
    ret += this.db.gdt.getTimezoneOffsetString();

    return ret;

}; // method ssd.date.getRFC822

/**
 * Returns a full date time in the format of:
 * 5/Nov/2010 23:43
 *
 * @return {string}
 */
ssd.date.prototype.getFullDateTime = function ()
{
    var c = ssd;
    var g = goog;
    var m = c.date.dbstatic.month;
    var logger = g.debug.Logger.getLogger('ssd.date.smallDatetime');
    var sdate = this.db.sDate;
    logger.fine('Init');

    var d = this.db.gdt;

    // get current date time
    var n = this.db.gdtnow;


    // apply formatings, start with date
    var dd = g.string.buildString(d.getDate());
    if (1 == dd.length)
        dd = '0' + dd;
    // month
    var mm = g.string.buildString(d.getMonth());
    if (1 == mm.length)
        mm = '0' + mm;
    var mmm = m[d.getMonth()];
    // hours
    var hh = d.getHours();
    if (12 < hh) {
        hh = g.string.buildString(hh - 12);
        if (1 == hh.length)
            hh = '0' + hh;
        var a_p = 'PM';
    } else {
        hh = g.string.buildString(hh);
        if (1 == hh.length)
            hh = '0' + hh;
        var a_p = 'AM';
    }
    // minutes
    var MM = g.string.buildString(d.getMinutes());
    if (1 == MM.length)
        MM = '0' + MM;


    var ret = dd  + '/' + mmm + '/' + d.getYear() + ' ' + hh + ':' + MM + ' ' + a_p;
    return ret;

}; // ssd.date.getFullDateTime

