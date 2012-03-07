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
 * created on Sep 16, 2011
 * menuAlerts.php E-mail Alerts menu
 *
 */
?>
<div id="um_tab_alerts_content" style="display:none">
  <h2 id="alerts_title">Alert me via e-mail when...</h2>
<form action="" id="um_tab_alerts_form" method="post">
  <div style="margin-bottom:30px;padding:0">
    <fieldset>
      <table>
        <col class="form_single_left" />
        <col class="form_single_right" />
        <tr>
          <td class="form_single_left"><input type="checkbox" name="mentions" id="alerts_mentions" value="1" checked /></th>
          <td class="form_single_right">
            <label for="alerts_mentions">someone <strong>mentions</strong> my nickname</label>
          </td>
        </tr>
        <tr>
          <td class="form_single_left"><input type="checkbox" name="comments" id="alerts_frame_comments" value="1" checked /></th>
          <td class="form_single_right">
            <label for="alerts_comments">someone <strong>comments</strong> on a frame i posted</label>
          </td>
        </tr>
        <tr>
          <td class="form_single_left"><input type="checkbox" name="messages" id="alerts_messages" value="1" checked /></th>
          <td class="form_single_right">
            <label for="alerts_messages">someone sends me a <strong>private message</strong></label>
          </td>
        </tr>

        <tr>
          <th class="form_single_left">&nbsp;</th>
          <td class="form_single_right">

            <div id="prof_alerts_server_error">
              <div class="text_error"></div>
            </div>
            <div id="prof_alerts_save" class="btn_m btn ">Save</div>
            <div id="prof_alerts_save_loader" style="display:none">
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