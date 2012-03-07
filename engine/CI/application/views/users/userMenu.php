<?php
/**
 *  @copyright  (C) 2000-2011 Thanasis Polychronakis - All Rights Reserved
 *  @author Thanasis Polychronakis <thanasisp@gmail.com>
 *
 * ********
 * This program is bound to the license agreement that can be found in the root
 * folder of this project. This Agreement does not give you any intellectual property
 * rights in the program. It does not Grand you permission to copy, distribute, redistribute
 * or make any possible use of this program, this is a private work intended for private use.
 *
 * You should have received a copy of the License Agreement along with this program
 * If not, write to: Plastikopiitiki S.A., Attn: Thanasis Polychronakis, P.O. Box 60374,
 * Zip 57001, Thermi, Greece
 *
 *
 * ********
 * created on Aug 15, 2011
 * userMenu.php The main user menu structure
 *
 */
?>
<!-- User Menu overlay begin -->
<div id="user_menu" class="overlay" style="position:fixed">
  <div  id="user_menu_box" class="overlay_box">
    <div id="user_menu_main">
      <img class="link overlay_x" src="/img/images/x.png" border="0"/>

      <div  id="user_menu_title" class="overlay_title deftone_title"></div>

      <div class="um_tab_master _msg_height">
        <div id="um_tab_main" class="goog-tab-bar goog-tab-bar-top">
          <div id="um_tab_messages" class="goog-rounded-tab goog-rounded-tab-selected">Messages</div>
          <div id="um_tab_notify" class="goog-rounded-tab"><div id="um_tab_notify_badge">4</div><div class="notify_title">Notifications</div>&nbsp;</div>
          <div id="um_tab_account" class="goog-rounded-tab">Account</div>
          <div id="um_tab_profile" class="goog-rounded-tab">Profile</div>
          <div id="um_tab_alerts" class="goog-rounded-tab">Email Alerts</div>
        </div>
        <div class="goog-tab-bar-clear"></div>
        <div id="um_tab_main_content" class="goog-tab-content _msg_height" >
          <div>
            <?php
            $this->load->view('users/menuMessages');
            $this->load->view('users/menuNotifications');
            $this->load->view('users/menuAccount');
            $this->load->view('users/menuProfile');
            $this->load->view('users/menuAlerts');
            ?>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<!-- User Menu overlay end -->