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
 *
 *
 * ********
 * created on Sep 8, 2011
 * userp.php Controller for user public requests
 *
 */


/**
 * Description of userp
 *
 * @author Thanasis Polychronakis <thanpolas@gmail.com>
 */
class userp extends CI_Controller {

  /**
   * Constructor - Access Codeigniter's controller object
   *
   */
  function __construct() {
    parent::__construct();
  }

  /**
   * Apublic method to get public user data objects
   * based on nickname (?) for now?...
   *
   *
   * @param string $nickname
   * @return void
   */
  public function get()
  {
    $nickname = $this->input->post('nickname');
    if (false === $nickname)
      raise_error('Please enter a proper nickname', 'nickname var not set');

    // validate if nick is ok and it doesn't exist.
    $vars = array('nickname' => $nickname);
    $nickname = Valid::CheckNick($vars, false, true);

    // get user data object
    $ud = $this->user->get($nickname);

    if (false === $ud)
      die_json (array('status' => 20));

    list(,$ud) = each($this->user->get_public($ud, true));
    $return = array(
      'status' => 10,
      'user' => $ud
    );

    die_json($return);

  }
}

?>