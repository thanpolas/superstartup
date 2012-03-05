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
 *  File:: system/conf.main.js 
 *  Core configurations for website / application
 *********
 */




goog.provide('core.conf');
goog.provide('core.STATIC');


/**
 * The sources (web, mob, facebook...)
 *
 * @enum {number}
 */
core.STATIC.SOURCES = {
    WEB: 1,
    MOB: 2,
    FB: 5,
    TWIT: 6
};

/**
 * Basic string length limits for validations
 * Values are inclusive (use >= or <=)
 *
 * @var object
 */
core.conf.userLengthLimits = {
    nick_lo: 1,
    nick_hi: 16,
    email_lo: 6,
    email_hi: 250,
    pass_lo: 6,
    pass_high: 30,
    fname_lo: 2,
    fname_hi: 30
};

/**
 * User class configuration
 * constants
 *
 * @var object
 */
core.conf.userConf = {
    keyupTimeout: 1500, // After how many ms should we validate after first keyup event
    checkAvailTimeout: 1500 // If nick/mail/etc is valid, how long after fire Check Avail
};


/**
 * Page configuration
 *
 * @var object
 */
core.conf.page = {
    /**
     * Sidebar Normal width with map display in px
     */
    mapPageWidth: 380,
    /**
     * Sidebar single page mode
     * this would be the width of the left sidebar in px
     */
    singlePageWidth: 188,
    /**
     * The total height of the master header in px
     */
    headerHeight: 109,
    /**
     * The body margin in px
     */
    bodyMargin: 10,
    /**
     * The core boxes border width in px
     */
    coreBorder: 2,
    /**
     * The height of the content's header in px
     */
    contentHeader: 30,
    /**
     * The height of the content's controls in px
     */
    contentControls: 0,
    /**
     * The margin we use for the content inside of the boxes
     */
    contentMargin: 10,
    /**
     * The content's footer height
     */
    contentFooter: 30

}; // core.conf.page



core.conf.root = {
    LANG_MAGIC_WORD: '%',
    timeNoticeClose: 5000,
    maxInfowindowWidth: 300,
    maxPhotos: 20,


    map: {
        defLat: 34.397, //default lat/lng for center position
        defLng: -90.644, //default is north america
        defZoom: 4 //continent zoom
    },
    mapMaxPanPx: 60, //maximun paning of map in pixels that will trigger a requery
    selclass: 'selected', // class for selected items
    semiselclass: 'semiselected', // class for semi selected items

    //The offset in px from the left side of the map. (is where we will display the filter)
    filterOffset: 90,
    /**
     * The size in pixels that we define as a marker's safe zone.
     * If other markers are inside this zone they get clustered
     */
    markersSafeZone: 6,
    cookiePerm: 'cookie_perm',
    cookieLogin: 'cookie_login'

};
