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
 * menuMessages.php The messages template
 *
 */
?>
<div id="um_tab_messages_content">
  <div id="um_tab_msg_left" class="_msg_height">
    <div id="um_tab_msg_left_header">Messages</div>
    <div id="um_tab_msg_left_items">
    </div>
    <div id="um_tab_msg_left_loader"><img src="/img/images/spinner.gif" /></div>
    <div id="um_tab_msg_left_nomessage">You have no messages</div>
  </div>
  <div id="um_tab_msg_right">
    <div class="pane_right_master">
      <div class="pane_right_slave _msg_height">
        <div class="pane_right_inner">
          <div class="pane_right_header">
            <span class="pane_right_header_title">Send <span class="_pane_right_header_nick"></span> a message</span>
            <div id="pane_right_header_counter" class="user_msg_counter msg_counter">140</div>
            <form style="padding:0px; margin:0px; display:inline" id="pane_right_header_form" method="post" action="">
              <textarea id="pane_right_header_form_message" name="message" rows="2" cols="47" class="user_msg_textarea textarea"></textarea>
              <input id="pane_right_header_form_btn" type="button" value="Send" class="btn_gray msg_btn btn" />
              <img id="pane_right_header_form_loader" class="msg_loader" height="16px" width="16px" src="/img/images/spinner.gif" />
              <div id="pane_right_header_form_success" class="msg_success">Message sent!</div>
              <div id="pane_right_header_form_error" class="msg_error">Message not sent</div>
            </form>
          </div>
          <div class="pane_right_content">
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
