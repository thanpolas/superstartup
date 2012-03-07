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
*  Handles all page/windows state / functionality
*  createdate 16/Dec/2009 
*
*/



goog.provide('web.ui');

goog.require('web.ui.alert');
goog.require('web.ui.sfv');
goog.require('web.ui.bottomScroll');
goog.require('web.ui.mobile');
goog.require('web.ui.dialogs');

//window['spt']['ui'] = web.ui;

/**
 * Execute this anon function when script loads
 * to set initial height of main
 *
 * 3b Aug/12/11 no longer required
 *
 *
(function(d, w){
  try {
    // set initial height for #main div
    var winH = 460;
    if (d.body && d.body.offsetWidth)
      winH = d.body.offsetHeight;
    if (d.compatMode=='CSS1Compat' &&
      d.documentElement &&
      d.documentElement.offsetWidth )
      winH = d.documentElement.offsetHeight;
    if (w.innerWidth && w.innerHeight)
     winH = w.innerHeight;
     // go for both main and SFV
    d.getElementById('main').style.height = (winH - 80 - 81) + 'px';
    //d.getElementById('sfv_all_frames').style.height = (winH - 80 - 81) + 'px';


  } catch(e) {}
})(document, window);
*/

web.ui.db = {
  fbClicked: false,
  resize: new Array(),
  /**
   * set this switch to true if footerInit runs when user
   * was authed, to prevent running again...
   */
  footSetandAuthed: false
};

/**
 * Executes hard coded from web.Init
 *
 * Initializes core UI elements and events
 *
 * @return {void}
 */
web.ui.INIT = function ()
{
  var j = $;
  var w = web, c = core, g = goog;

  var log = c.log('web.ui.INIT');

  log.info('Init');

  // perform initial resize
  w.ui.resize();
  // setup resize global listener for our app

  j(window).smartresize(function(){
    w.ui.resize();
  });

  // start loading twitter's widgets after 500ms
  setTimeout(function(){
    var twString = '<script src="http://platform.twitter.com/widgets.js" type="text/javascript"></script>';
    j('body').append(twString);

    // start init cycle for our twitter lib
    c.twit.Init();

  }, 500);

  // stop here if in Single Frame View
  if (w.SFV) {
    w.ui.sfv.Init();
    return;
  }

  // frontpage and booth have login paths
  if (w.BOOTH || w.FRONT)
    w.user.login.bindLogin();

  // stop here if not in Booth
  if (!w.BOOTH)
    return;


  // start loading feedback widget after 5"
  setTimeout(w.ui.startFeedback, 5000);






    // Open TWITTER INVITE button on a new neat popup
    // like the one that's opened via the standard twitter
    // share button...
    // original code from: http://www.webpop.com/blog/posts/add-a-custom-twitter-button-to-your-website
    j('#booth_share_tw').click(function(event) {

      try {


        log.info('Twitter Share clicked. href:' + this.href);
        c.analytics.trackEvent('Invite', 'Twitter-click');
        c.analytics.trackMetrics('Invite', 'twitter', 'click', '', w.booth.getBoothName(), w.booth.getBoothId());

        return;

        //event.preventDefault();

        //c.twit.openShareWindow(this.href);


        return false;
      } catch (e) {
        core.error(e);
      }

    });


  // open FACEBOOK INVITE button...
  j("#booth_share_fb").click(function (event) {
    try {
    event.preventDefault();



    var post = new c.fb.API.post();

    // prepare the parameters object
    var curUrl = window.location.href;
    var params = {
      properties: [
        { text: 'Join now #' + w.booth.getBoothName(), href: curUrl }
      ],
      picture: 'http://boothchat.com/img/boothchat_logo.png',

      description:'Boothchat is the online photo booth. Snap pictures of yourself while you chat and have instant fun!',
      name: 'I\'m on BoothChat right now! Join me live!',
      actions: [{name: 'Enter Booth', link: curUrl}],
      link: curUrl
    };

    //log.info('sending FB post with params:' + g.debug.deepExpose(params));

    // set the class parameters
    post.setParams(params);
    // perform the post now
    post.perform(function(state, id){
      log.info('Facebook api recieved. state:' + state + ' id:' + id);
      if (state) {
        // succesfully shared on FB
        c.analytics.trackEvent('Invite', 'Facebook-shared', '',  1);
        c.analytics.trackMetrics('Invite', 'facebook', 'shared', id, w.booth.getBoothName(), w.booth.getBoothId());
        c.analytics.trackSocial('facebook', 'invite', curUrl);
      }

    });
    c.analytics.trackEvent('Invite', 'Facebook-click');
    c.analytics.trackMetrics('Invite', 'facebook', 'clicked', '', w.booth.getBoothName(), w.booth.getBoothId());





    } catch (e) {
        core.error(e);
    }

    return false

  });


/*
 * Code from borjo for smoother scrolling on touch devices

                function isTouchDevice(){
                        try{
                                document.createEvent("TouchEvent");
                                return true;
                        }catch(e){
                                return false;
                        }
                }

                function touchScroll(id){
                        if(isTouchDevice()){ //if touch events exist...
                                var el=document.getElementById(id);
                                var scrollStartPos=0;

                                document.getElementById(id).addEventListener("touchstart", function(event) {
                                        scrollStartPos=this.scrollTop+event.touches[0].pageY;
                                        event.preventDefault();
                                },false);

                                document.getElementById(id).addEventListener("touchmove", function(event) {
                                        this.scrollTop=scrollStartPos-event.touches[0].pageY;
                                        event.preventDefault();
                                },false);
                        }
                }
*/






};



/**
 * Keeps sizes and offsets of important elements
 *
 * Offsets refer to top left corner
 */
web.ui.winSizes = {
  /**
     * Total window real estate
     */
  win: {
    width: 0,
    height:0
  },
  /**
     * Right [main]Content's clear space for content
     * ommiting header and controls height
     */
  mainContent: {
    top: 0,
    left: 0,
    contTop: 0,
    contLeft: 0,
    width:0,
    height:0,
    contWidth: 0,
    contHeight: 0
  },
  /**
     * Left sidebar clear space for content
     * ommiting header and controls height
     */
  sidebar: {
    top: 0,
    left: 0,
    contTop: 0,
    contLeft: 0,
    width:0,
    height: 0,
    contWidth: 0,
    contHeight: 0
  },
  // set the header and footer height's and calculate the desired height...
  headerHeight: 70,
  footerHeight: 70
}; //winSizes object

/**
 * Start the feedback widget loading
 * and capture event for click
 *
 * @return {void}
 */
web.ui.startFeedback = function ()
{
  try {
    var g = goog, j = $;
    var log = core.log('web.ui.startFeedback');

    // print to DOM the feedback scripts loader...
    var feedbackScript = "<script type=\"text/javascript\">";
    feedbackScript += "var uvOptions = {};";
    feedbackScript += "(function() {";
    feedbackScript += "var uv = document.createElement('script'); uv.type = 'text/javascript'; uv.async = true;";
    feedbackScript += "uv.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'widget.uservoice.com/3cCvcwVWbarXTYOEvT1TA.js';";
    feedbackScript += "var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(uv, s);";
    feedbackScript += "})();";
    feedbackScript += "</script>";


    j("#feedback_script").html(feedbackScript);
    // show feedback button
    j("#bt_feedback").dispOn();
    // listen to feedback click event
    j("#bt_feedback").click(function(){
      var uv = UserVoice;
      if (g.isObject(uv)) {
        uv.showPopupWidget();
      }
      log.info('Click on feedback');
    });
  } catch (e) {
    core.error(e);
  }

};

/**
 * Closes the master loader
 *
 * @return {void}
 */
web.ui.loaderClose = function ()
{
  try {
    var j = $;

    // show the master loader
    j("#master_loader").dispOff();



  } catch (e) {
    core.error(e);
  }

};

/**
 * Opens the master loader
 *
 * @param {string=} opt_loader_text Optionaly define a small message to show
 * @return {void}
 */
web.ui.loaderOpen = function (opt_loader_text)
{
  try {
    var j = $;

    var txt = opt_loader_text || '&nbsp;';
    j('#master_loader_text').text(txt);

    // hide other items
    j("#connect").dispOff();
    j("#chat_container").dispOff();
    j("#late_chat_overlay").dispOff();
    // show the master loader
    j("#master_loader").dispOn();

  } catch (e) {
    core.error(e);
  }

};


/**
 * Triggers when we are ready to disaply either the connect
 * dialogue or the textline depending if user is Authed or not
 *
 * @return {void}
 */
web.ui.initFooter = function ()
{
  try {
    var w = web, j = $, c = core;
    if (!w.BOOTH)
      return;
    var log = c.log('web.ui.initFooter');

    log.info('Init. Authed:' + c.isAuthed() + ' runAgainAuthed:' + w.ui.db.footSetandAuthed);
    // hide items
    j("#connect").dispOff();
    j("#chat_container").dispOff();
    j("#late_chat_overlay").dispOff();

    // [don't] reset user
    //j("#chat_user_image img").attr('src', '/img/images/noimage.gif');
    //j("#chat_user_name").text('');

    // hide loader as well
    w.ui.loaderClose();

    if (c.isAuthed()) {
      w.user.login.initLogin();
    } else {
      j("#connect").dispOn();
    }

  } catch (e) {
    core.error(e);
  }

}; // web.ui.initFooter



/**
 * Triggers when user reaches frame window bottom
 * Will load history of booth
 *
 * @param {type}  description
 * @return {void}
 */
web.ui.reachedFrameBottom = function ()
{
  try {
    var w = web, j = $, c = core, g = goog;

    var log = c.log('web.ui.reachedFrameBottom');

    if (!c.chat.history.haveMore())
      return;
    if (c.chat.history.working())
      return;


    log.fine('We reached bottom... If authed loading history...');



    // get the last frame ID
    var lastFrame = j('.main_holder .item').last();
    var lastId = w.ui.cssId(lastFrame, 'chat-');

    // start the loader...
    j("#main_history_loader").dispOn();


    c.chat.history.get(lastId, function(status, obj){
      log.fine('Callback for getHistory() fired. status:' + status);

      if (!status) {
        log.warning('History loading failed:' + obj);
        j("#main_history_loader").dispOff();
        return;
      }

      // we have chat objects
      // reverse the order of itterating
      g.array.forEach(obj['chats'], function(onechat, index){
        try {
         var chObj = {
            chat: onechat,
            user: c.user.getDummyObject()
          }

          // check if we can find a user object
          var u = obj['users'][onechat['userId']];
          if (c.user.isUserObject(u))
            chObj.user = u;

          chat.ui.addChatLine(chObj, true);
        } catch (e) {
          j("#main_history_loader").dispOff();
          core.error(e);
        }

      });

      // count that as a page
      c.analytics.trackPageview('/booths/history/' + c.chat.history.getPages());
      j("#main_history_loader").dispOff();

    });

  } catch (e) {
    j("#main_history_loader").dispOff();
    core.error(e);
  }

}; // web.ui.reachedFrameBottom


/**
 * We will recreate the pageEngine class assigning all important variables
 * to the new instance. We do that so that the pe reinitialises with new
 * jquery values. (when we load content dynamicly the html elements do not
 * exist at the time this class initialises)
 *
 * @return void
 */
web.ui.refresh = function()
{
  var s = web;
  s.pe = new s.ui.db.pe();
  var j = $;
  var g = goog;
  var log = g.debug.Logger.getLogger('web.ui.refresh');

  // add hover class to .row_hover items
  s.pe.controls.rowHover.hoverClass("hover_row");
  // add hover class to .link items
  j(".link").hoverClass("link_hover");
  // add hover class to .btn items
  j(".btn_15").hoverClass("btn_hover_15");
  j(".btn_25, input.btn").hoverClass("btn_hover_25");
  j(".btn_35, .btn_m").hoverClass("btn_hover_35");
  j(".btn_45, .btn_l").hoverClass("btn_hover_45");
  j(".btn_53_orange").hoverClass("btn_hover_53_orange");

  // trap manage categories pseudo classes
  j("._manage_cat").click(function(){
    s.ui.h.setToken(s.ui.History.tokens.spot.manageCategories);
  });

  // trap all spot links, point to SDV
  j("._sdv_spot").click(function(event){
    event.preventDefault();


    // check if not found
    var spid = s.ui.cssId(j(this), '_spid_');

    j(this).height(100);
    j(this).css('bgcolor', '#ff00ff');


    if (false == spid) {
      log.severe('A spot link was clicked for SDV but _spid_ prefixed class was not found');
      return;
    }

    // we got the spid, launch SDV
    s.spot.spot.events.spotClick(spid);

  });

  // trap all user links, point to PUP
  j("._pup_user").click(function(event){
    event.preventDefault();


    // check if not found
    var nick = s.ui.cssId(j(this), '_nick_');
    //log.shout('here:' + nick);
    //j(this).height(100);
    //j(this).css('bgcolor', '#ff00ff');


    if (false == nick) {
      log.severe('A user link was clicked for PUP but _nick_ prefixed class was not found');
      return;
    }

    // We got nick Change the History to display the pup
    s.ui.h.setToken(s.ui.History.tokens.user.pup + nick);


  });

  /**
     * Add event handlers to global objects
     *
     */
  // help add spot link
  j("._help_add_spot").click(s.ui.cstm.help.addSpot);

  // set tooltips
  // Don't, we need to init each new item seperatly
  //s.ui.tooltip(j('[title]'));

  s.ui.log.fine('Page Elements Refreshed');

}; // method refresh

/**
 * Will fetch an ID stored in an element as a css class
 *
 * We expect a jQuery element and the prefix we want
 * to extract the id from
 * e.g. cssId(jQ, '_spid_')
 * will return r42F4 if the element has a class named:
 * _spid_r42F4
 *
 * @param {array} jQel jQuery element
 * @param {string} prefix of css
 * @return {string|boolean} false if fail / not found
 */
web.ui.cssId = function (jQel, prefix)
{

  var g = goog, c = core;
  var log = g.debug.Logger.getLogger('web.ui.cssId');

  if (!c.isjQ(jQel))
    return false;

  // get the DOM element and check if it's there
  var el = jQel[0];
  if (!g.isObject(el))
    return false;


  // get all element's classes...
  var arClasses = el.className.split(" ");
  // now look for prefixed class
  if (!g.isArray(arClasses)) {
    log.severe('arClasses is not an array');
    return false;
  }

  var found = false;
  var objId = null;

  g.array.forEach(arClasses, function(itemClass, index){
    // check for prefix
    if (prefix == itemClass.substr(0,prefix.length)) {
      // found it!
      found = true;
      objId = itemClass.substr(prefix.length);
    }
  });

  if (found)
    return objId;

  // not found
  return false;
}; // method web.ui.cssId



/**
 * Gets window real estate and returns the values in a simple object
 * obj.width / obj.height
 *
 * code from: http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
 *
 * @return object
 */
//
web.ui.getWindowRes = function ()
{
  //
  var winWidth = 0, winHeight = 0;
  if( typeof( window.innerWidth ) == 'number' ) {
    //Non-IE
    winWidth = window.innerWidth;
    winHeight = window.innerHeight;
  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
    //IE 6+ in 'standards compliant mode'
    winWidth = document.documentElement.clientWidth;
    winHeight = document.documentElement.clientHeight;
  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
    //IE 4 compatible
    winWidth = document.body.clientWidth;
    winHeight = document.body.clientHeight;
  }
  return {
    height:winHeight,
    width:winWidth
  };
};

/**
 * Will resize all page elements that need be resized
 *
 * We will calculate the web.ui.winsizes data object
 *
 * Resize the core elements of the page if web.ui.db.doresize
 *   allows us to
 *
 * And loop through all resize hooks we have
 *
 * @return {void}
 */
web.ui.resize = function ()
{
  var w = web;
  var ui = w.ui;
  var g = goog;
  var log = g.debug.Logger.getLogger('web.ui.resize');
  //var cp = s.conf.page;
  var j = $;
  log.fine('Init - Resize event just fired');



  // This code was html inline, fixes main window sizes
  //var height = j(window).height();

  //if (height > 520)
   // j('#home_master').css('height', height + 'px');
    //document.getElementById('home_master').style.height=a+'px';

  // calculate height for main chat window
  //a = height-80-56-55;
  //j('#main').css('height', a + 'px');
  //document.getElementById('main').style.height=a+'px';
  var win = window;
  var height = j(win).height();
  var width = j(win).width();
  var r = w.ui.db.resize;
  // execute any listening functions
  w.ui.resizeEvent.runEvent('resize', {width:width, height:height});

  if (w.SFV) {
    //j('#sfv_all_frames').css('height', (height - 80 - 81) + 'px');
  } else {
    // 3b Aug/12/11 no longer needed inline scroll, we now scroll the hole page
    //j('#main').css('height', (height - 80 - 81) + 'px');

    // calculate position for camera
    if (!w.webcam.isCameraOn()) {
      j("#chatbox_videofeed").css('left', Math.abs(width / 2) - 110);
    }
  }


  return;
  // get window size
  var size = ui.getWindowRes();

  // assign window size to our local winSizes db
  w.win.width = size.width;
  w.win.height = size.height;

  // we need to resize the main chat area...


  return;

}; // method resize

/**
 * We hook functions to the resize event.
 *
 * Each function we hook gets called with an object
 * containing these keys: height width
 *
 * This function also executes (initialises) the listener
 * once
 *
 *
 * @param {function} fn The function to callback
 * @return {void}
 * @depricated Use web.ui.resizeEvent
 */
web.ui.resizeHook = function (fn)
{
  web.ui.resizeEvent.addEventListener('resize', fn);



}; // method web.ui.resizeHook

/**
 * Create a new instance of the events listeners class
 * to use for resize events.
 *
 * Attach to this instance.
 * Events triggered:
 * resize :: {width:Number, height:Number}
 *
 */
web.ui.resizeEvent = new core.events.listeners();

/**
 * Will set the page title
 *
 * @param {string} title The title
 * @param {boolean=} opt_append If we need to append to the title and not overwrite it
 * @return void
 */
web.ui.setTitle = function (title, opt_append)
{


  if ('' == title) {
    document.title = 'BoothChat is the Online Photo Booth';
    return;
  }
  if (opt_append)
    document.title += title;
  else
    document.title = 'BoothChat :: ' + title;
};



/**
 * Will Change the photo of an img tag
 *
 * Will apply effects on the given img tag, fade out,
 * change photo, fade in
 *
 * @param {jQuery} jQCont
 * @param {object} imgObj Image Data object containing keys: url, height, width || h, w
 * @param {number=} opt_maxpix Optional maximum pixels of img width/height 73 = default
 * @return {void}
 */
web.ui.photoChange = function (jQCont, imgObj, opt_maxpix)
{
  var s = web;
  var w = geowarp;
  var g = goog;
  var j = $;
  var log = g.debug.Logger.getLogger('web.ui.photoChange');
  var phconf = s.conf.photos.spot;

  var maxpix = opt_maxpix || phconf.big.width;

  if (!g.isObject(imgObj)) {
    log.severe('imgObj is not an object. jQCont.selector:' + jQCont.selector + ' imgObj:' + imgObj);
    return;
  }

  imgObj['w'] = imgObj['w'] || imgObj['width'];
  imgObj['h'] = imgObj['h'] || imgObj['height'];
  // set fixed resize pixels we want
  var pho = w.resizePixels(maxpix, imgObj);

  // start fade out
  jQCont.animate({
    opacity: "0"
  }, 1000, function(){
    // when finished, change photo
    jQCont.attr('src', pho.url);
    // wait for new image to load and fade in
    jQCont.load(function(){
      // change dimentions
      log.fine('Setting new data:' + g.debug.expose(pho));
      jQCont.attr('width', pho.w);
      if (0 != pho.h) jQCont.attr('height', pho.h);
      jQCont.animate({
        opacity: "1"
      }, 1000);
    });
  });

}; // method web.ui.photoChange

/**
 * Calculates and returns optimal width
 * and positioning of modal window based
 * on desired width.
 *
 * We return an object with the calculated values:
 * {
 *      width: 0,
 *      left: 0, // the left position of the modal
 * }
 *
 * @param {Number} width The desired width
 * @return {object(width: Number, left: Number)}
 */
web.ui.getModalDims = function (width)
{
  var s = web;

  //get window real estate
  var size = s.ui.getWindowRes();
  //check if we have available width
  if (width > size.width - 20) {
    //not, we want 10px left and right so we set the new width
    width = size.width - 20;
  }
  //set left pixel ofset of dialog
  var left = (size.width - width) / 2;

  return {
    width: width,
    left: left
  };
};


/**
 * Sets proper height to new opening overlay elements
 *
 * We actually set the height of the overlay to match
 * window's height
 *
 * @param {jQuery} jQ The jQuery element to set height
 * @return {void}
 * @deprecated use web.ui.dialogs.overlayHeight()
 */
web.ui.overlayHeight = web.ui.dialogs.overlayHeight;
