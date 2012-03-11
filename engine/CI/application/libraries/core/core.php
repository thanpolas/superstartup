<?php
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
 * Core file for initializing needed variables, constants
 * and functionality.
 * 
 *
 */

// make CI happy with a class declaration
class Core {}



// we have 'error', 'debug'
log_message('info', 'core library starting...');


$ci = & get_instance();






// Set global variables and prepare environment
// set the current working environment, wrap around CI's
// model
define('PRODUCTION', (ENVIRONMENT == 'production' ? true : false));
define('PREPROD', (ENVIRONMENT == 'testing' ? true : false));
define('DEVEL', (ENVIRONMENT == 'development' ? true : false));

//set our two core directory variables, check if command line

  define('__DIR_WEB_ROOT', substr(FCPATH,0, -1));

  define('__DIR_PROJECT_ROOT', substr(__DIR_WEB_ROOT, 0,strrpos(__DIR_WEB_ROOT, "/") ));

/**
 * Check if we are in AJAX mode
 *
 */
if (1 == $ci->input->get('ajax') || 1 == $ci->input->post('ajax'))
  define('IN_AJAX', true);
else
  define('IN_AJAX', false);

require APPPATH . '/libraries/core/valid.class.php';

// require our production counter for .css and .js master files
require __DIR_PROJECT_ROOT . '/engine/bin/99.prodcounter_do_not_run.php';




    /**
     *
     * Define sources
     *
     * Sources represent external web integrations
     * and Authentication autoritative sources
     *
     */
    define ('SOURCE_WEB', 1);
    define ('SOURCE_MOB', 2);
    define ('SOURCE_FB' , 5);
    define ('SOURCE_TWIT', 6);



try {


  // set timezones to DB
  $ci->db->Query(MY_DB::SetTimezone());

  // don't set timezone for PHP, CI handles that now
  //$ci->main->SetTimezones();

  /**
   * Execute up to this point if in CLI mode
   *
   */
  if ($ci->input->is_cli_request()) {
    return;
  }


  /**
   * Prepare to pass to JS Core Environment values
   *
   */
  $pass = array(
      'DEVEL' => DEVEL,
      'PRODUCTION' => PRODUCTION,
      'PREPROD' => PREPROD
  );




  // pass the current environment to JS
  $ci->main->JsPass(5, $pass);



  // lame hack, at this point autoload for models
  // has not fired yet, so we manualy 'autoload' the
  // user model although it's in the autoload scheme...
  $ci->load->model('core/user');

  // check if user is authed
  if ($ci->user->isAuthed()) {
    // user is authed

    $ci->main->JsPass(102, $ci->user->get_public());
    /**
     * Insert random events here
     *
     * - Flash metric
     */
    // Flash metric, set to 0% (values 0 to 1 and between)
    if (run_random(0)) {
      $ci->main->JsPass(53);
    }


    // check if is new user (from twitter signup) - FB is done JS side
    if ($ci->session->userdata('tweeterNewUser')) {
      $ci->main->JsPass(121, array('newuser' => true));
      $ci->session->unset_userdata('tweeterNewUser');
    }

  }





  // set global var 'For first time' to declare that user is here for first time ever
  $isFirstTime = false;

  // check if user landed here for the first time (today, not ever)
  if (!$ci->session->userdata('sessionOpened')) {
    //no session, create needed data
    $isFirstTime = true;

    // load User Agent class
    $ci->load->library('user_agent');
    $sessData = array (
        'is_referral' => $ci->agent->is_referral(),
        'referrer' => $ci->agent->referrer(),
        'is_mobile' => false,
        'mobile' => '',
        'landPage' => '/' . $ci->uri->uri_string()
    );

    // load up permanent cookie model if not robot
    if (!$ci->agent->is_robot()) {
      $ci->load->model('core/userperm');
      $sessData['permData'] = $ci->userperm->newVisitor();


    } else {
      $sessData['permData'] = array(
          'permId' => 0
      );
    }

    $ci->session->set_userdata('sessionOpened', true);
    $ci->session->set_userdata('sessionData', $sessData);

    // check if visitor is on mobile device
    if ($ci->agent->is_mobile()) {
      // s/he is on mobile
      $mob_ar = array(
          'mobile' => $ci->agent->mobile()
      );
      // update our user session data
      $sessData['is_mobile'] = true;
      $sessData['mobile'] = $mob_ar['mobile'];

      // pass the is_mobile to JS engine
      $ci->main->JsPass(20, $mob_ar);
    }

  } // if user opens new session

  // now execute whatever is needed if the user already has a session with us
  if (!$isFirstTime) {
    // get the session Data
    $sessData = $ci->session->userdata('sessionData');

    $ci->load->library('user_agent');
    // check if our permCook is valid
    if (0 == $sessData['permData']['permId'] && !$ci->agent->is_robot()) {
      // not valid permCook, ask from client to request
      //to get it
      $ci->load->model('core/userperm');
      $sessData['permData'] = $ci->userperm->newVisitor();
      $ci->session->set_userdata('sessionData', $sessData);
    }


    // check if visitor is on mobile device
    if ($sessData['is_mobile']) {
      //die('is mobile');
      // s/he is on mobile
      $mob_ar = array(
          'mobile' => $sessData['mobile']
      );

      // pass the is_mobile to JS engine
      $ci->main->JsPass(20, $mob_ar);
    }
  } // if not first time

  // set the permanent ID to it's global var
  $ci->PERMID = $sessData['permData']['permId'];

  // pass the metadata object...
  $ci->load->model('core/metadata');
  $ci->main->JsPass(56, $ci->metadata->getMetadata());







  // check if user has landed here via e-mail
  $mailLand = $ci->session->userdata('mailLand');

  if ($mailLand) {
    if (1 < $mailLand['count']) {

      // remove the record from session to not execute again...
      $ci->session->unset_userdata('mailLand');
    } else {
      //die(debug_r($mailLand));
      // user landed from e-mail link, load email control and pass proper
      // instructions to JS
      $ci->load->model('core/emailcontrol');
      $ci->emailcontrol->mailLand($mailLand);

      $mailLand['used'] = true;
      $mailLand['count']++;
      $ci->session->set_userdata('mailLand', $mailLand);
    }
  }

} catch (Exception $e) {
  raise_error($e->getMessage());
}


?>