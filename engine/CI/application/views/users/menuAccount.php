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
 * menuAccount.php The Account template
 *
 */
?>
<div id="um_tab_account_content" style="display:none">
  <div class="um_content_left">
  <form action="" id="um_tab_account_form" method="post">
    <div style="margin:0;padding:0">
      <fieldset>
        <table>
          <colgroup>
            <col class="form_single_left" />
            <col class="form_single_right" />
          </colgroup>
          <tbody>
            <tr>
              <th class="form_single_left">Fullname</th>
              <td class="form_single_right">
                <span id="um_account_fullname">Thanasis Polychronakis</span>
                <p>
                <small class="text_gray">
                  Change your fullname from the <span class="link_on_white link" id="um_account_profile_link">profile settings</span>
                </small>
                </p>
              </td>
            </tr>
            <tr>
              <th class="form_single_left"><label for="nickname">Nickname</label></th>
              <td class="form_single_right">
                <input class="textfield" id="um_account_nickname" maxlength="16" name="nickname" size="16" type="text" value="thanpolas" />
                <small class="availability" style="display:none">Checking for availability...</small>
                <small class="text_success"></small>
              </td>
            </tr>
            <tr>
              <th class="form_single_left">
                <label for="email">
                  <span>email</span>
                </label>
              </th>
              <td class="form_single_right">
                <input id="um_account_email" class="textfield" name="email" size="30" type="text" value="" />
                <small class="availability" style="display:none">Checking...</small>
                <small class="text_success"></small>
                <p>
                  <small class="text_gray">We will not display your e-mail anywhere public</small>
                </p>
              </td>
            </tr>
            <tr>
              <th class="form_single_left"></th>
              <td class="form_single_right">
                <div id="um_account_save" class="btn_m btn" >Save</div>
                <div id="um_account_save_loader" style="display:none">
                  <img height="16px" width="16px" src="/img/images/spinner.gif" alt="Load Indicator" />
                  Please wait...
                </div>
              </td>
            </tr>
          </tbody>
        </table>

      </fieldset>
    </div>
  </form>



  </div>
  <div class="um_content_right">
    <div class="um_content_right_btn">
      <div class="btn _logout _usermenu">Logout</div>
    </div>
  </div>
</div>
