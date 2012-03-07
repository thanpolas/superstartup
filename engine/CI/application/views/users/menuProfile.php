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
 * menuProfile.js [File Description]
 *
 */
?>
<div id="um_tab_profile_content" style="display:none">
<form action="" id="um_tab_profile_form" method="post">
  <div style="margin-bottom:30px;padding:0">
    <fieldset>
      <table>
        <col class="form_single_left" />
        <col class="form_single_right" />
        <tr>
          <th class="form_single_left">Fullname</th>
          <td class="form_single_right">
            <input class="textfield" id="prof_fullname" maxlength="30" name="fullname" size="20" type="text" value="" />
            <div id="prof_fname_valid">
              <small class="text_success" style="display:none">ok</small>
              <small class="text_error" style="display:none"></small>
            </div>
            <p class="text_gray"><small>Type your real name, so people you know can recognise you</small></p>
          </td>
        </tr>
        <tr>
          <th class="form_single_left">Location</th>
          <td class="form_single_right">
            <input class="textfield" id="prof_location" maxlength="30" name="location" size="20" type="text" value="" />
            <p class="text_gray"><small>Where do you live?</small></p>
          </td>
        </tr>
        <tr>
          <th class="form_single_left">Web</th>
          <td class="form_single_right">
            <input class="textfield" id="prof_web" maxlength="30" name="homepage" size="20" type="text" value=""/>
            <p class="text_gray"><small>Have a website or a blog? Type it here</small></p>
          </td>
        </tr>
        <tr>
          <th class="form_single_left">Bio</th>
          <td class="form_single_right">

            <textarea rows="2" name="bio" id="prof_bio" cols="30" class="textarea" ></textarea>
            <p class="text_gray"><small>Something about yourself in less than 140 chars</small></p>
          </td>
        </tr>
        <tr>
          <th class="form_single_left">&nbsp;</th>
          <td class="form_single_right">

            <div id="prof_prof_server_error">
              <div class="text_error"></div>
            </div>
            <div id="prof_prof_save" class="btn_m btn ">Save</div>
            <div id="prof_prof_save_loader" style="display:none">
              <img height="16px" width="16px" src="/img/images/spinner.gif" alt="Load Indicator" />
              Please wait...
            </div>


          </td>
        </tr>

      </table>

    </fieldset>
  </div>
</form>
</div>