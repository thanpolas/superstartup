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
 * created on Aug 19, 2011
 * profileModal.php Public user profile modal
 *
 */
?>
<div id="user_prof" class="overlay">
  <div  class="overlay_box">
    <div class="overlay_box_header">
      <img class="link overlay_x _prof_close" src="/img/images/x.png" border="0"/>
      <img src="/img/images/logo_diagonal.png" class="logo_diag" />
      <div class="user_prof_header">
        <div class="user_prof_photo_container">
          <img id="user_prof_photo" class="profile_miniphoto" src="/img/images/noimage.gif" />
        </div>
        <div class="user_prof_title_container">
          <span id="user_prof_title" class=" deftone_title"></span>
        </div>
      </div>
    </div>
    <div id="user_prof_main" class="overlay_box_main">
      <div id="user_prof_main_top">
        <div id="user_prof_loading">
          <img  height="16px" width="16px" src="/img/images/spinner_overlay.gif" />
          &nbsp;Loading...
        </div>
        <div id="user_prof_notfound">
          We are sorry, user <span id="user_prof_notfound_user"></span> was not found
        </div>

        <div class="pup_basic_info">
          <div class="pup_details">
            <div class="pup_nickloc">
              <span class="pup_nickname"></span>
              <span class="pup_location"></span>
            </div>
            <div><span class="pup_bio" class="pup_bio"></span></div>
            <div><a href="" target="_blank" class="link pup_web link"></a></div>
          </div>
        </div>



      </div>
      <div id="user_prof_main_msg">

        <h3 class="font_gold">Send a private message</h3>
        <div id="user_prof_msg_counter" class="msg_counter">140</div>
        <form style="padding:0px; margin:0px; display:inline" id="user_prof_msg_form" method="post" action="">
          <textarea id="user_prof_msg_text" name="message" rows="2" cols="37" class="msg_textarea textarea"></textarea>
          <div id="user_prof_msg_btn" class="msg_btn btn">Send</div>
          <img id="user_prof_msg_loader" class="msg_loader" height="16px" width="16px" src="/img/images/spinner_overlay.gif" />
          <div id="user_prof_msg_success" class="msg_success">Message sent!</div>
          <div id="user_prof_msg_error" class="msg_error">Message not sent</div>
        </form>
        <div style="clear:both;"></div>


      </div>

      <div class="user_prof_footer">
        <div  class="btn_m btn _prof_close prof_close">Close</div>
      </div>

    </div>

  </div>
</div>