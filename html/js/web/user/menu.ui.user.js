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
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 *
 *
 *********
 * created on Jun 28, 2011
 * menu.ui.user.js [File Description]
 *
 */


goog.provide('web.user.ui.menu');

goog.require('web.user.account');
goog.require('web.user.profileForm');
goog.require('web.user.account.ui');
goog.require('web.user.alerts');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.RoundedTabRenderer');
goog.require('goog.ui.Tab');
goog.require('goog.ui.TabBar');

web.user.ui.menu.db = {
  menuOpen: false,
  /**
   * Google menutabs class container
   *
   */
  menuTabs: null
};

/**
 * Triggers when DOM is ready, we do some binds
 *
 * @return {void}
 */
web.user.ui.menu.Init = function ()
{
  try {
    var w = web, j = $, c = core, g = goog;

    var log = c.log('web.user.ui.menu.Init');

    if (w.SFV || w.PAGE)
      return;


    log.info('Init');

    j('#chat_user').click(w.user.ui.menu.open);


    // construct the user tabs in 1"
    setTimeout(w.user.ui.menu.constructTabs, 1000);
    // get an instance of the message class
    w.user.ui.db.msgCls = new w.user.ui.msgCls();

    // close event by click on X
    j("#user_menu_main .overlay_x").click(w.user.ui.menu.close);



  } catch (e) {
    core.error(e);
  }

}; // web.user.ui.Init
// listen for ready event
core.ready.addFunc('main', web.user.ui.menu.Init, 300);


/**
 * Construct the tabs of the menu
 *
 * @return {void}
 */
web.user.ui.menu.constructTabs = function()
{
  try {
    var w = web, j = $, c = core, g = goog;

    if (!w.BOOTH)
      return;



    var log = c.log('web.user.ui.menu.constructTabs');

    log.info('Init');
    // let's create the tabbed menu
    // docs at: http://closure-library.googlecode.com/svn/docs/class_goog_ui_TabBar.html
    var menuTabs = w.user.ui.menu.db.menutabs = new g.ui.TabBar();

    menuTabs.decorate(g.dom.getElement('um_tab_main'));

   // Handle SELECT events dispatched by tabs.
    g.events.listen(menuTabs, g.ui.Component.EventType.SELECT,
        function(e) {

          var tabSelected = e.target;
          log.info('SELECT event. id:' + menuTabs.getId() + ' tab:' + tabSelected.getCaption());
          var jmsg = j('#um_tab_messages_content');
          var jnotify = j('#um_tab_notify_content');
          var jaccnt = j('#um_tab_account_content');
          var jprof = j('#um_tab_profile_content');
          var jalert = j('#um_tab_alerts_content');
          jmsg.dispOff();
          jaccnt.dispOff();
          jprof.dispOff();
          jnotify.dispOff();
          jalert.dispOff();
          switch (tabSelected.getId()) {
            case 'um_tab_messages':
              jmsg.dispOn();
              // if the menu is not open then we don't want to take
              // any action from this function
              if (!w.user.ui.menu.db.menuOpen)
                return;
              w.user.ui.db.msgCls.open();
            break;
            case 'um_tab_account':
              jaccnt.dispOn();
              w.user.account.open();
            break;
            case 'um_tab_profile':
              jprof.dispOn();
              w.user.profileForm.open();
            break;
            case 'um_tab_notify':
              jnotify.dispOn();
              w.user.notify.open();
            break;
            case 'um_tab_alerts':
              jalert.dispOn();
              w.user.alerts.open();
            break;
          }
        });



    // resize the menu for the first time
    w.user.ui.menu.resize();


  } catch (e) {
    core.error(e);
  }

};







/**
 * Click on chat user icon. Open / close user menu
 *
 * @param {object=} opt_event jQuery event object
 * @return {void}
 */
web.user.ui.menu.open = function (opt_event)
{
  try {
    var w = web, j = $, c = core;

    var log = c.log('web.user.ui.menu.open');

    log.info('Init. open:' + w.user.ui.menu.db.menuOpen);

    var jMenu = j('#user_menu');

    if (w.user.ui.menu.db.menuOpen) {
      return;
    }


    w.ui.dialogs.addCloseEvents(jMenu, w.user.ui.menu.close);

    // put the logged in users nickname in the title
    j("#user_menu_title").text(c.user.getNickname());

    // select message tab
    w.user.ui.menu.db.menutabs.setSelectedTabIndex(0);

    // open the menu
    jMenu.dispOn();

    // hook resize event
    w.ui.resizeEvent.addEventListener('resize',
        w.user.ui.menu.resize, 'web.user.ui.menu.Init');
    // run it once
    w.user.ui.menu.resize();


    // get messages from server
    w.user.ui.db.msgCls.open();

    // fix Fixed issue if in mobile
    if (w.MOB)
      w.ui.mobile.fixedTop(jMenu, 'userMenu');

    w.user.ui.menu.db.menuOpen = true;

  } catch (e) {
    core.error(e);
  }

}; // web.user.ui.menu.open

/**
 * Closes the user menu
 *
 * @param {type} opt_event description
 * @return {void}
 */
web.user.ui.menu.close = function (opt_event)
{
  try {
    var w = web, j = $, c = core, g = goog;

    var log = c.log('web.user.ui.menu.close');

    log.info('Init');
    var jMenu = j('#user_menu');

    jMenu.dispOff();
    w.user.ui.menu.db.menuOpen = false;

    // unhook from window resize event
    w.ui.resizeEvent.removeEventListener('resize','web.user.ui.menu.Init');


    // fix Fixed issue if in mobile
    if (w.MOB)
      w.ui.mobile.fixedTopRemove('userMenu');

  } catch (e) {
    core.error(e);
  }

}; // web.user.ui.menu.close




/**
 * Triggers when we have a resize event
 *
 * @param {opt_object=} sizeObj object containing width/height of available window
 * @return {void}
 */
web.user.ui.menu.resize = function (opt_sizeObj)
{
  try {
    var j = $, g = goog, w = web;

    var sizeObj = opt_sizeObj || null;

    if (g.isNull(sizeObj)) {
      // resize elements
      var win = window;
      sizeObj = {width: j(win).width(), height:j(win).height()};
    }

    // calculate height
    // 30px from top, 30px from bottom
    // 300 min
    var height = sizeObj.height - 60;
    if (300 > height)
      height = 300;

    // calculate height for our content
    var contHeight = height - 60;

    // calculate right pane content

    var totalPadding = 57; // total top/bottom padding of content in px
    var paneHeight = contHeight - ((w.user.ui.db.msgCls.formOpen() ? 120 : 60) + totalPadding);
    j(".pane_right_content").height(paneHeight);

    j("#user_menu_box").height(height);
    j("._msg_height").height(contHeight);

  } catch (e) {
    core.error(e);
  }

};
