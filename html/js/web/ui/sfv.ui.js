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
 * created on Jun 14, 2011
 * sfv.ui.js UI for Single Frame View
 *
 */


goog.provide('web.ui.sfv');

// Store here static data
web.ui.sfv.data = {
  // sfvData as passed from server, cought in tagLander
  sfvData: null
}

/**
 * Initializes SFV elements
 *
 *
 * @return {void}
 */
web.ui.sfv.Init = function ()
{
  try {
    var w = web, j = $, c = core, g = goog;

    var log = c.log('web.ui.sfv.Init');

    log.info('Init');
    var data = w.ui.sfv.data;


    // track enter clicks
    j('.enter').click(function(){
      c.analytics.trackEvent('sfv', 'click_enter_btn');
    });
    // track logo clicks
    j('#logo').click(function(){
      c.analytics.trackEvent('sfv', 'click_logo');
    });
    // track booth name click
    j('#booth_name').click(function(){
      c.analytics.trackEvent('sfv', 'click_booth_name');
    });

    // Listen for clicks on next / previous
    j('._sfl').click(function(event){
      // get all element's classes...
      var arClasses = j(this)[0].className.split(" ");

      // now look for prefixed class
      if (!g.isArray(arClasses)) {
        log.severe('arClasses is not an array');
        return;
      }

      // set switches for next/prev and title or box
      var next = false;
      var title = false;

      g.array.forEach(arClasses, function(itemClass, index){
        switch(itemClass) {
          case '_next':
            next = true;
            break;
          case 'small_frame_link':
            title = true;
            break;
        }
      });
      // track proper event
      c.analytics.trackEvent('sfv', 'click_' + (next ? 'next' : 'prev'), (title ? 'title' : 'box'));
    });

    // put FB Like button
    var likeParams = {
      layout: 'button_count',
      ref: 'sfv',
      font: 'trebuchet ms',
      width: '160',
      colorscheme: 'light'
    };
    // we put it inline...
    //j(".fb_like").html(c.fb.getLikeButton(window.location.href, likeParams));
    try {FB.XFBML.parse();}catch(e){}

    j('.tw_share').click(function(event) {
      try {
        log.info('Twitter Share clicked.');
        var data = w.ui.sfv.data;
        c.analytics.trackEvent('Share-Frame', 'Twitter-sfv-open');
        c.analytics.trackMetrics('Share-frame', 'sfv-twitter', data.sfvMain.id, 'sfv', data.boothData.boothId, data.boothData.boothName);
      } catch (e) {core.error(e);}
    });









  } catch (e) {
    core.error(e);
  }

}; // web.ui.sfv.Init



/**
 * Executes when we have proper data loaded
 * in our static data object
 *
 * (tagLander executes us)
 *
 * @return {void}
 */
web.ui.sfv.dataReady = function ()
{
  try {
    var w = web, j = $, c = core, g = goog;

    var log = c.log('web.ui.sfv.updateTimes');

    log.info('Init');

    // shortcut assign data objects
    var data = w.ui.sfv.data;

    var sfvData = data.sfvData;
    data.boothData = sfvData['boothData'];
    data.sfvMain = sfvData['frameData']['main'];
    data.sfvPrev = sfvData['frameData']['prev'];
    data.sfvNext = sfvData['frameData']['next'];
    data.users = sfvData['frameData']['users'];

    // decide if we have prev or next
    var next = false, prev = false;
    if (g.isString(data.sfvPrev['author'])) prev = true;
    if (g.isString(data.sfvNext['author'])) next = true;

    // update the times...
    var dt = new c.date(data.sfvMain['ts']);
    j("#main_time").text(dt.getDiffStringAgo(true));
    if (prev) {
      var dt =  new c.date(data.sfvPrev['ts']);
      j("#prev_time").text(dt.getDiffStringAgo(true));
    }
    if (next) {
      var dt =  new c.date(data.sfvNext['ts']);
      j("#next_time").text(dt.getDiffStringAgo(true));
    }

    // let booth now which is the current booth we are looking into now...
    w.booth.db.currentBooth = data.boothData;

    // pass the proper objects to facebook share element
    var jfb = j('.fb_share');
    jfb.data('chObj', data.sfvMain);
    jfb.data('userObj', data.users[data.sfvMain.userId]);
    jfb.data('source', 'sfv');
    jfb.data('boothName', data.boothData['boothName']);
    // Listen for facebook post click
    jfb.click(chat.ui.clickFBshare);

    // parse text for mentions, channels, links etc
    var parse = w.chat.parse.parse;

    j('#next_text').html(parse(data.sfvNext['text']));
    j('#prev_text').html(parse(data.sfvPrev['text']));
    j('#main_text').html(parse(data.sfvMain['text']));
    // any user mentions click
    j('.user_mention').click(w.chat.parse.clickMention);


    // prepare the twitter share button links

    var chObj = w.ui.sfv.data.sfvMain;
    chObj.user = data.users[chObj.userId];

    // check for twitter identity
    var extSource = c.web2.getUserExt(chObj.user, c.STATIC.SOURCES.TWIT, true);

    var foundTW = (c.STATIC.SOURCES.TWIT == extSource.sourceId ? true : false);

    // prepare twitter link parameters
    var shareText = '"' + chObj['text'] + '" by ' + (foundTW ? '@' + extSource['extUsername'] : chObj.user['nickname']);
    var shareUrl = chObj.frameUrl;
    var params = {
      via: 'boothchat'
    };
    if (foundTW) {
      params.related = extSource['extUsername'];
    }

    var href = c.twit.getHref(shareText, shareUrl, params);

    // assign the value to the twitter button
    j(".tw_share").attr("href", href);
    var twShare = {
      source: 'sfv_main',
      item_id: chObj['id'],
      shareUrl: shareUrl
    };
    j('.tw_share').data('twShare', twShare);

    // track on MixPanel
    c.analytics.trackMP('SFV-page', {
      'frameId': chObj.id,
      'boothName': data.boothData.boothName,
      'nickname': chObj.user.nickname
    });

  } catch (e) {
    core.error(e);
  }

}; // web.ui.sfv.updateTimes

