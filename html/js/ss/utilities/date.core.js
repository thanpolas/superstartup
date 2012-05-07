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
 *  File:: utilities/date.ss.js
 *  Generic date class. Used for formating
 *********
 */


goog.provide('ss.date');

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
ss.date = function (opt_sDate)
{
    var c = core;
    var g = goog;
    var log = g.debug.Logger.getLogger('ss.date');

    log.fine('Init - sDate:' + opt_sDate);



    this.db = {
        sDate: opt_sDate || null, // the string date as passed from parameters
        gdt: {}, // the google date instance
        // get current date time
        gdtnow: new g.date.DateTime()
    }

    if (g.isString(opt_sDate)) {
        // execute method to fill our date data object (this.db.dt)
        //this._getDatetimedb();
        //log.info('Here:' + opt_sDate);
        //Wed, 02 Oct 2002 15:00:00 +0200
        this.db.gdt = g.date.DateTime.fromRfc822String(opt_sDate);

        // check if the string validated ...
        if (g.isNull(this.db.gdt)) {
          // no it didn't, let's try a normal MySQL string
          // Code from: http://stackoverflow.com/questions/3075577/convert-mysql-datetime-stamp-into-javascripts-date-format
          // Split timestamp into [ Y, M, D, h, m, s ]
          //var t = opt_sDate.split(/[- :]/);

          // Apply each element to the Date function
          //this.db.gdt = new g.date.DateTime(t[0], t[1]-1, t[2], t[3], t[4], t[5]);

          // try another way that'll work as well...
          this.db.gdt = new g.date.fromIsoString(opt_sDate);
        }

    } else {
        this.db.gdt = new g.date.DateTime();
    }

    // check if gdt is set
    if (g.isNull(this.db.gdt)) {
        // not set, use now
        this.db.gdt = new g.date.DateTime();
    }
    /**
     * bring given date to UTC / GMT datetime
     *
     * 22/Oct/2010 No need for this, google's data class
     * does this automaticaly
     *
    // first if there are hours offset make them minutes

    var tzofst = Number(this.db.dt.ofstHours) * 60;
    // now add up any minutes
    tzofst = tzofst + Number(this.db.dt.ofstMinutes);
    // if the sign is + then substract the minutes... else add
    var tzofst = ('+' == this.db.dt.ofstSign ? tzofst * -1 : tzofst);
    var clientOfst = this.db.gdtnow.getTimezoneOffset() * -1;
    // now set the offset
    log.fine('seting offset minutes:' + tzofst + ' our ofst:' + clientOfst);
    //this.db.gdt.setUTCMinutes(tzofst);

    */


    /**
     * Now make given date be at client's timezone
     *
     * Reverse sign of .getTimezoneOffset()
     * for the calculation to work properly
     */
    //this.db.gdt.setUTCMinutes(clientOfst);

    /**
     * There seems to be a bug with setUTCMinutes
     * it gets a little off each time...
     */


    return this;
}

ss.date.dbstatic = {
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
}; // property ss.date.db


/**
 * Get time difference in a string format in ago type
 * e.g. 1 minute ago, 2 days ago, etc...
 *
 * @param {boolean} opt_short If we need a shorter version define true
 * @return {string}
 */
ss.date.prototype.getDiffStringAgo = function (opt_short)
{
    var c = core;
    var g = goog;
    var log = g.debug.Logger.getLogger('ss.date.getDiffStringAgo');

    log.fine('Init');

    var dt = this.db.gdt;
    /*new Date(
        this.db.dt.year, this.db.dt.month, this.db.dt.date,
        this.db.dt.hours, this.db.dt.minutes, this.db.dt.seconds
    );*/

    var diff = c.date.getDiffSecs(dt);


    // more than a day ago
    if (86400 < diff ) return this.smallDate();


    if (60 > diff) return diff + (c.MOBILE || opt_short ? 'secs' : ' seconds ago');
    if (120 > diff) return ( c.MOBILE || opt_short ? '1 min' : 'about a minute ago');
    if (3600 > diff) return ( c.MOBILE || opt_short ? Math.floor(diff / 60) + ' min' : 'about ' + Math.floor(diff / 60) + ' minutes ago');
    if (7200 > diff) return ( c.MOBILE || opt_short ? '1 hour' : 'about an hour ago');
    if (86400 >= diff) return ( c.MOBILE || opt_short ? Math.floor(diff / 3600) + ' hours' : 'about ' + Math.floor(diff / 3600) + ' hours ago');

    return '';
}; // method ss.date.getDiffStringAgo

/**
 * A static function that calculates
 * the dirrence from the given google date
 * compared to now in seconds
 *
 * @param {goog.date.DateTime} gDate
 * @return {Number} seconds
 */
ss.date.getDiffSecs = function (gDate)
{
  try {
    var g = goog;

    if (g.isNull(gDate))
      return 0;
    var dtnow = new g.date.DateTime();

    var epoch = Math.floor(gDate.getTime() / 1000);
    var epochnow = Math.floor(dtnow.getTime() / 1000);

    return Math.abs((epochnow - epoch));
  } catch(e) {ss.error(e);}
};


/**
 * Will return the smallest possible data time
 * string. If within this year, we ommit year,
 * if same day we ommit month
 *
 * e.g. 12:32 PM May 25
 * 09:23 AM Dec 23, 2009
 */
ss.date.prototype.smallDatetime = function ()
{
    var c = core;
    var g = goog;
    var m = c.date.dbstatic.month;
    var log = g.debug.Logger.getLogger('ss.date.smallDatetime');
    var sdate = this.db.sDate;
    log.fine('Init');

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
        log.finer('Year Orig:' + sdate + ' Formated:' + ret);
        return ret;
    }

    // check if not in same month
    if (d.getMonth() != n.getMonth()) {
        // different month, display it as hh:MM mmm dd
        var ret =  mmm + '/' + dd  + ' ' + hh + ':' + MM + '' + a_p;
        log.finer('Month Orig:' + sdate + ' Formated:' + ret);
        return ret;
    }

    // check if in same day
    if (d.getDate() == n.getDate()) {
        // same day, display as hh:mm
        var ret = d.getHours() + ':' + MM + '' + a_p;
        log.finer('Date same Orig:' + sdate + ' Formated:' + ret);
        return ret;

    }

    // different day, display it as dd mmm
    //var ret = d.toLocaleFormat('mmm'); //d.getDate() + ' ' + m[d.getMonth()];
    var ret = dd + '/' + mmm + ' ' + hh + ':' + MM + ' ' + a_p;



    log.finer('Date Not same Orig:' + sdate + ' Formated:' + ret);
    return ret;

}; // method ss.data.smallDatetime

/**
 * Returns a formated date in the shortest type.
 * E.g. 01:34 am, 4 Apr, 2009
 *
 *
 * @return {string|null} formated date or null if sdate does not validate
 */
ss.date.prototype.smallDate = function ()
{
    var c = core;
    var g = goog;
    var m = c.date.dbstatic.month;
    var log = g.debug.Logger.getLogger('ss.date.smallDate');
    var sdate = this.db.sDate;
    log.fine('Init:' + g.typeOf(this.db.gdt));

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
        log.finer('Year Orig:' + sdate + ' Formated:' + ret);
        return ret;
    }

    // check if not in same month
    if (d.getMonth() != n.getMonth()) {
        // different month, display it as dd mmm
        var ret = mmm + ' ' + d.getDate();
        log.finer('Month Orig:' + sdate + ' Formated:' + ret);
        return ret;
    }

    // check if in same day
    if (d.getDate() == n.getDate()) {
        // same day, display as hh:mm
        var ret = d.getHours() + ':' + MM + ' ' + a_p;
        log.finer('Date same Orig:' + sdate + ' Formated:' + ret);
        return ret;

    }

    // different day, display it as dd mmm
    //var ret = d.toLocaleFormat('mmm'); //d.getDate() + ' ' + m[d.getMonth()];
    var ret = mmm + ' ' + d.getDate();
    log.finer('Date Not same Orig:' + sdate + ' Formated:' + ret);
    return ret;


}; // method ss.date.smallDate


/**
 * Calculate the date time object
 * from a RFC822 type: Wed, 26 May 2010 23:17:17 +0000
 *
 *
 * @private
 * @return {void}
 */
ss.date.prototype._getDatetimedb = function ()
{
    var c = core;
    var g = goog;
    var log = g.debug.Logger.getLogger('ss.date._getDatetimedb');

    log.fine('Init');

    var sdate = this.db.sDate;

    // set parameter date
    this.db.dt = {
        year: Number(sdate.substr(11,5)), // year
        month: c.date.dbstatic.monthRev[sdate.substr(8,3)], // month
        date: sdate.substr(5,2), // date
        hours: sdate.substr(17, 2), // hours
        minutes: sdate.substr(20, 2), // minutes
        seconds: sdate.substr(23,2), // seconds
        ofst: sdate.substr(26,5), // offset
        ofstSign: sdate.substr(26,1), // offset sign (+/-)
        ofstHours: sdate.substr(27,2), // offset hours
        ofstMinutes: sdate.substr(29,2) // offset minuts
    };



    log.fine('Chopped date to values::'
        + ' year:' + this.db.dt.year
        + ' month:' + this.db.dt.month
        + ' date:' + this.db.dt.date
        + ' hours:' + this.db.dt.hours
        + ' minutes:' + this.db.dt.minutes
        + ' seconds:' + this.db.dt.seconds
        + ' offset:' + this.db.dt.ofst
        + ' offset Sign:' + this.db.dt.ofstSign
        + ' offset Hours:' + this.db.dt.ofstHours
        + ' offset Minutes:' + this.db.dt.ofstMinutes
        );


}; // method ss.date._getDatetimedb

/**
 * Get current date in RFC822 format: Wed, 26 May 2010 23:17:17 +0000
 *
 * @return {string} date RFC822 type: Wed, 26 May 2010 23:17:17 +0000
 * @constructor
 */
ss.date.prototype.getRFC822 = function ()
{
    var c = core;
    var g = goog;
    var log = g.debug.Logger.getLogger('ss.date.getRFC822');

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

}; // method ss.date.getRFC822

/**
 * Returns a full date time in the format of:
 * 5/Nov/2010 23:43
 *
 * @return {string}
 */
ss.date.prototype.getFullDateTime = function ()
{
    var c = core;
    var g = goog;
    var m = c.date.dbstatic.month;
    var log = g.debug.Logger.getLogger('ss.date.smallDatetime');
    var sdate = this.db.sDate;
    log.fine('Init');

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

}; // ss.date.getFullDateTime

