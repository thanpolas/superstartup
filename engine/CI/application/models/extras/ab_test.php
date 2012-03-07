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
 * created on Oct 19, 2011
 * ab_test.php AB testing class
 *
 */

/**
 * Description of ab_test
 *
 * @author Thanasis Polychronakis <thanasisp@gmail.com>
 */
class ab_test extends CI_Model {
  public function __construct() {
    parent::__construct();
  }

  /**
   * Get a version for our A/B testing
   *
   * @param {string} $scenario a unique id
   * @return {int}
   */
  public function getVersion($scenario)
  {
    // check if we have a value stored in our session
    $ab_test = $this->session->userdata('ab_test');

    if (isset($ab_test[$scenario]))
      return $ab_test[$scenario];

    // not set, create it
    $ver = rand(1,4);

    $ab_test = array(
      $scenario => $ver
    );
    // store this in our session
    $this->session->set_userdata('ab_test', $ab_test);

    return $ver;
  }

  /**
   * Lets us know if there is an AB test running on
   * the current session
   *
   * @return boolean
   */
  public function inTest()
  {
    // check if we have a value stored in our session
    $ab_test = $this->session->userdata('ab_test');

    if (is_array($ab_test))
      return true;

    return false;


  }

  /**
   * Returns the AB test that is currently running in
   * a string format
   *
   * @return string
   */
  public function getTest()
  {
    // check if we have a value stored in our session
    $ab_test = $this->session->userdata('ab_test');

    if (!is_array($ab_test))
      return '';

    $ret = '';
    foreach($ab_test as $key => $value) {
      $ret = $key . '-' . $value . '/';
    }

    $ret = substr($ret, 0, strlen($ret) - 1);

    return $ret;
  }

}
