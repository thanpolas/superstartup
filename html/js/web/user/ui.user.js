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
 * created on Jun 18, 2011
 * ui.user.js Users UI functions
 *
 */


goog.provide('web.user.ui');

goog.require('web.ui.textCounter');
goog.require('web.user.ui.message');
goog.require('web.user.ui.menu');
goog.require('core.user.notify');

web.user.ui.db = {
  menuOpen: false,
  profileTextCounter: null,
  msgCls: null,
  getMailInit: false,
  getMailOpen: false
};

/**
 * Triggers when DOM is ready, we do some binds
 *
 * @return {void}
 */
web.user.ui.Init = function ()
{
  try {
    var w = web, j = $, c = core;
    if (!w.BOOTH)
      return;
    var log = c.log('web.user.ui.Init');

    log.info('Init');

    // bind listeners for user profile close
    j('._prof_close').click(w.user.ui.profClose);

    // listen for new notifications event
    c.user.notify.hookNew(w.user.ui.setNotify);

    // catch all logout buttons / links
    j('._logout').click(w.user.login.logout);


  } catch (e) {
    core.error(e);
  }

}; // web.user.ui.Init
// listen for ready event
core.ready.addFunc('main', web.user.ui.Init);



/**
 * Closes the user profile modal
 *
 * @return {void}
 */
web.user.ui.profClose = function ()
{
  try {
    var j = $, c = core, w = web;

    var log = c.log('web.user.ui.profClose');

    log.info('Init');
    j('#user_prof').dispOff();
    // remove resize listener if fixed
    if (w.MOB)
      w.ui.mobile.fixedTopRemove('userModal');


  } catch (e) {
    core.error(e);
  }

}; // web.user.ui.profClose


/**
 * Opens the user public profile modal
 *
 * @param {object|string} user A standard user data object or
 *    a nickname to query the server for a data object for
 * @return {void}
 */
web.user.ui.profOpen = function(user)
{
  try {
    var j = $, c = core, g = goog, w = web;

    var log = c.log('web.user.ui.profOpen');

    log.info('Init');

    // show the modal
    var jOver = j("#user_prof");
    jOver.fadeIn();
    // fix the height of the overlay element
    w.ui.overlayHeight(jOver);
    // fix top / scrolling of overlay content
    w.ui.dialogs.fixScroll(jOver);

    // add close events for overlay
    w.ui.dialogs.addCloseEvents(jOver, w.user.ui.profClose);



    // fix Fixed issue if in mobile
    if (w.MOB)
      w.ui.mobile.fixedTop(jOver, 'userModal');


    // clear / reset all fields
    j("#user_prof_title").text('');
    j('#user_prof_photo').attr('src', '/img/images/noimage.gif');
    // reset the prv msg and counter
    w.user.ui.db.profileTextCounter.reset();
    j('#user_prof_msg_loader').dispOff();
    j('#user_prof_msg_success').dispOff();
    j('#user_prof_msg_error').dispOff();
    j('.pup_nickname').text('');
    j('.pup_location').text('');
    j('.pup_bio').text('');
    j('.pup_web').text('');
    j('#user_prof_main_msg').dispOff();
    j('#user_prof_notfound').dispOff();

    // show loader
    j('#user_prof_loading').dispOn();

    // check if we have a string or a data object
    if (g.isObject(user)) {
      // it's a data object, call fill func directly
      w.user.ui._profOpenFill(user);
      return;
    }

    // we have a string, request data object from server
    c.user.pub.get(user, function(status, ud){
      try {
        if (!status) {
          // no results...
          j('#user_prof_loading').dispOff();
          j('#user_prof_notfound_user').text(user);
          j('#user_prof_notfound').dispOn();
          return;
        }
        // user found, show data...
        w.user.ui._profOpenFill(ud);
      } catch (e) {
        core.error(e);
      }

    });









  } catch (e) {
    core.error(e);
  }

}; // web.user.ui.profOpen

/**
 * After profile open (.profOpen) when we have
 * a proper user data object we call this function
 * to fill in the data
 *
 * @param {object} user proper user data object
 * @return {void}
 * @private
 */
web.user.ui._profOpenFill = function (user)
{
  try {
    var j = $, c = core, g = goog, w = web;

    var log = c.log('web.user.ui._profOpenFill');

    log.info('Init');

    // close loader
    j('#user_prof_loading').dispOff();


    // check for valid user data object
    if (!c.user.isUserObject(user)) {
      log.warning('User object passed not valid!:' + g.debug.expose(user));
      j('#user_prof_notfound_user').text('');
      j('#user_prof_notfound').dispOn();
      return;
    }


    j("#user_prof_title").text(user['fullname']);


    j('#user_prof_msg_text').data('user', user);
    j('._user_prof_finduseron').text('Find ' + user['nickname'] + ' on:');
    var img = '';
    if (g.isArray(user.extSource)) {
      try {
        img = user.extSource[0].extProfileImageUrl;
      } catch(e) {

      }
    }

    if (g.Uri.parse(img).hasScheme())
      j('#user_prof_photo').attr('src', img);

    // make loader dissapear and set all fields
    j('.pup_nickname').text('@' + user['nickname']);

    // now try to get profile info...
    var loc = '', bio = '', www = '';
    try {loc = user['profile']['location'];} catch(e){}
    try {bio = user['profile']['bio'];} catch(e){}
    try {www = user['profile']['web'];} catch(e){}

    j('.pup_location').text(loc);
    j('.pup_bio').text(bio);
    j('.pup_web').text(www);
    j('.pup_web').attr('href', www);

    // decide if we'll display the 'send private message'
    if (c.isAuthed())
      // check if logged in user same as profile user
      if (c.user.getUserId() == user['userId'])
        j('#user_prof_main_msg').dispOff();
      else
        j('#user_prof_main_msg').dispOn();
    else
      j('#user_prof_main_msg').dispOff();

  } catch (e) {
    core.error(e);
  }


};


/**
 * Directly link jQuery element's click event with
 * this method.
 *
 * We require that the element has a 'user' data stored
 *
 * @param {object} event jQuery event object
 */
web.user.ui.profOpenData = function (event)
{
  try {
    var w = web, j = $;
    // get the element
    var el = j(event.currentTarget);
    // call user profile modal with user data object
    w.user.ui.profOpen(el.data('user'));
  } catch (e) {core.error(e);}
};




/**
 * Opens the user modal menu
 *
 * @return {void}
 */
web.user.ui.clickMenu = function ()
{
  try {










  } catch (e) {
    core.error(e);
  }

}; // web.user.ui.openMenu


/**
 * Set / reset notifications for user
 *
 * Display or remove the badge from the user's
 * avatar on the chat line
 *
 * @return {void}
 */
web.user.ui.setNotify = function ()
{
  try {
    var c = core, j = $;
    var log = c.log('web.user.ui.setNotify');

    log.info('Init');

    var jNot = j("#chat_user_notify");

    jNot.dispOff();

    if (c.user.notify.has()) {
      // get the notification data object
      var notData = c.user.notify.get();

      jNot.text(notData.totalNotifications);
      jNot.dispOn();
    }
  } catch (e) {
    core.error(e);
  }


};



/**
 * Renders a user mini-profile and returns it
 *
 * @param {object} user User data object
 * @return {jQuery}
 */
web.user.ui.renderMiniProfile = function (user)
{
  try {
    var w = web, j = $, c = core, g = goog;
      // clone our text element template
      var jQchat = j("#templates .profile").clone();

      // set user's image if it's a URL
      // first get the right var...
      var img = '';
      if (g.isArray(user.extSource)) {
        try {
          img = user.extSource[0].extProfileImageUrl;
        } catch(e) {
          core.error(e);
        }
      }

      if (g.Uri.parse(img).hasScheme())
        jQchat.find('.profile_miniphoto').attr('src', img);


      // set username
      jQchat.find('.profile_name').text(user['nickname']);

      // set data object
      jQchat.find('._link_user').data('user', user);

      // set location
      var loc = '';
      try {
        loc = user['profile']['location'];
      }catch(e){}
      jQchat.find('._link_user_location').text(loc);


      // bind click for user profile
      jQchat.find('._link_user').click(w.user.ui.profOpenData)


      return jQchat;


  } catch (e) {
    core.error(e);
  }

}; // web.user.ui.renderMiniProfile


/**
 * Triggers when we have a new user.
 *
 * This is currently called from TagLanderParse...
 *
 * but in the future should include functionality from
 * inline authentication flows (FB) when new user
 *
 * @return {void}
 */
web.user.ui.newUser = function ()
{
  try {
    var w = web,  c = core;

    var log = c.log('web.user.ui.newUser');

    log.info('Init');

    // check if new user is from Twitter
    if (c.user.auth.hasExtSource(c.STATIC.SOURCES.TWIT)) {
      // now check that we don't have an e-mail
      var u = c.user.getUserDataObject();
      log.info('Newuser is from twitter. email:' + u.email);
      if ('' == u.email) {
        // show getemail modal
        w.user.ui.openGetEmailModal();
      }
    }
  } catch (e) {
    core.error(e);
  }

}; // web.user.ui.newUser

/**
 * Will open the get-email modal and ask user to enter e-mail
 *
 * @param {boolean=}  opt_isOldUser set to true if user is not new
 * @return {void}
 */
web.user.ui.openGetEmailModal = function (opt_isOldUser)
{
  try {
    var w = web, j = $, c = core;

    var log = c.log('web.user.ui.getEmailModal');

    log.info('Init. Modal Open:' + w.user.ui.db.getMailOpen);

    // check if already open
    if (w.user.ui.db.getMailOpen)
      return;
    w.user.ui.db.getMailOpen = true;

    var jOver = j('#getmail');
    jOver.dispOn();
    // fix top / scrolling of overlay content
    //w.ui.dialogs.fixScroll(jOver);
    // fix the height of the overlay element
    //w.ui.overlayHeight(jOver);

    // get user data, chop nick to 9 chars so it fits ok
    var u = c.user.getUserDataObject();
    j('#getmail_title_nick').text(u.nickname.substr(0,9));

    // now check if not new user
    if (opt_isOldUser) {
      // change welcome to 'hey'
      j('#getmail_title_prefix').text('Hey');
      j('#getmail_content').text("We don't seem to have your e-mail, please type it here");
    }


    // check if we have already binded to events
    if (w.user.ui.db.getMailInit)
      return;

    w.user.ui.db.getMailInit = true;

    // bind events
    j('#getmail_form').submit(w.user.ui.getEmailSubmit);
    j('#getmail_submit').click(w.user.ui.getEmailSubmit);

  } catch (e) {
    core.error(e);
  }
}; // web.user.ui.getEmailModal

/**
 * Handles submition of the get Email modal form
 *
 * @param {type} e description
 * @return {void}
 */
web.user.ui.getEmailSubmit = function (e)
{
  try {
    var w = web, j = $, c = core;

    var log = c.log('web.user.ui.getEmailSubmit');

    log.info('Init');

    // show the loader
    j('#getmail_submit').css('visibility', 'hidden');
    j('#getmail_loader').css('display', 'inline');

    // we'll cheat and use the submit account
    // methods....
    // collect the data...
    var u = c.user.getUserDataObject();
    var datafields = {
      nickname: u.nickname,
      email: j('#getmail_textfield').val()
    };

    c.user.profile.submitAccount(datafields, function(status, opt_errmsg){
      try {
        log.info('Submit Callback. status:' + status + ' opt_errmsg:' + opt_errmsg);
        j('#getmail_submit').css('visibility', 'visible');
        j('#getmail_loader').dispOff();

        if (status) {
          // profile submitted successfuly
          w.ui.alert('Thank you', 'success');
          w.user.ui.db.getMailOpen = false;
          j('#getmail').dispOff();

          // create GA event ???
          //c.analytics.trackEvent('UserMenu', 'account_saved');


        } else {
          // error in submition
          w.ui.alert(opt_errmsg, 'error');
        }


      } catch (e) {
        core.error(e);
      }

    });

    return false;

  } catch (e) {
    core.error(e);
    j('#getmail_submit').css('visibility', 'visible');
    j('#getmail_loader').dispOff();
    return false;
  }

}; // web.user.ui.getEmailSubmit
