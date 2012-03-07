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
 * ********
 * created on Jun 8, 2011
 * metrics.php Metrics library
 *
 */

if (!defined('BASEPATH'))
  exit('No direct script access allowed');



class Metrics {

  private $CI;

  function __construct() {
    $this->CI = & get_instance();
  }

  /**
   * A generic counter for any type of events we may want to track
   *
   * e.g.
   * $this->metrics->trackCounter('Invite', 'twitter', '', '', 'BOOTH_NAME', 'BOOTH_ID');
   * $this->metrics->trackCounter('Invite', 'facebook', 'clicked', '', 'BOOTH_NAME', 'BOOTH_ID');
   * $this->metrics->trackCounter('Invite', 'facebook', 'shared', 'FB-SHARE-ID', 'BOOTH_NAME', 'BOOTH_ID');
   *
   * $this->metrics->trackCounter('auth', 'login', 'SOURCE_ID');
   * $this->metrics->trackCounter('booths', 'joins', 'BOOTH_NAME', 'BOOTH_ID', 'TOTAL_USERS_IN_BOOTH');
   *
   * The parameters are mostly arbitrary, use at your own convenience
   *
   * @param string $category The main category of the event we want to track
   * @param string $action The specific action that took place
   * @param string $opt_label [optional] A label
   * @param string $opt_value [optional] A value
   * @return void
   */
  public function trackCounter($category, $action, $opt_label = '', $opt_value = '',
          $opt_value2 = '', $opt_value3 = '', $opt_value4 = '')
  {

    // we do not perform any validations, these are internal methods
    $insert = array (
        'userId' => $this->CI->user->getID(),
        'permId' => $this->CI->PERMID,
        'nickname' => $this->CI->user->getNickname(),
        'userIPaddress' => $this->CI->input->ip_address(),
        'category' => $category,
        'action' => $action,
        'label' => $opt_label,
        'value' => $opt_value,
        'value_2' => $opt_value2,
        'value_3' => $opt_value3,
        'value_4' => $opt_value4
    );
    // set time to now
    $this->CI->db->set('createDateTime', 'now()', false);
    // and insert...
    $this->CI->db->insert('metrics_counters', $insert);

  // method trackCounter
  }

// class Metrics
}

?>