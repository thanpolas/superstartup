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
 * ********
 * created on Aug 16, 2011
 * usersets.php User settings saving
 *
 */


class Usersets extends CI_Model {
  /**
   * Access the parent methods
   */
  function __construct() {
    parent::__construct();

  }



  /**
   * Update user's profile account information
   * (nickname, e-mail)
   *
   * @param array $data Array containing required data for the update
   * @return boolean
   */
  public function account($data)
  {
    $this->db->where('userId', $this->user->getID());

    $update = array();
    if ($data['nicknameUpdate'])
      $update['nickname'] = $data['nickname'];
    if ($data['emailUpdate'])
      $update['email'] = $data['email'];

    $this->db->update('users', $update);

    // update done, update our local user object
    $this->user->updateUser();

    return true;
  }



  /**
   * Update user's profile information
   * (fullname, location, web, bio)
   *
   * @param array $data Array containing required data for the update
   * @return boolean
   */
  public function profile($data)
  {
    $this->db->where('userId', $this->user->getID());

    // fullname is on users table
    $update = array();
    $update['real_name'] = $data['fullname'];
    $this->db->update('users', $update);

    // the rest are on users_info table
    $update = array();
    $update['location'] = $data['location'];
    $update['web'] = $data['web'];
    $update['bio'] = $data['bio'];

    $this->db->set('userEditCount', 'userEditCount + 1', false);
    $this->db->set('lastUpdate', 'now()', false);
    $this->db->where('userId', $this->user->getID());
    $this->db->update('users_info', $update);

    // check if we affected any rows...
    if (0 == $this->db->affected_rows()) {
      // no rows affected, the record does not exist, create it
      $this->db->set('lastUpdate', 'now()', false);
      $update['userEditCount'] = 1;
      $update['userId'] = $this->user->getID();
      $this->db->insert('users_info', $update);
    }

    // update done, update our local user object
    $this->user->updateUser();

    return true;
  }

  /**
   * Handles user e-mail alerts submition...
   *
   * @param array $vars
   * @return void
   */
  public function alerts($vars)
  {
    // prepare the array to insert to the user...
    $settings = array (
        'alerts' => array(
            'mentions' => $vars['mentions'],
            'frameComments' => $vars['frameComments'],
            'messages' => $vars['messages']
        )
    );

    $update = array(
        'settings_data' => serialize($settings)
    );

    $this->db->where('userId', $this->user->getID());
    $this->db->update('users', $update);

    // update session user object now...
    $this->user->updateUser();


  }



}

?>