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
 * created on Aug 19, 2011
 * userperm.php Permanent cookie for visitors
 *
 */

class Userperm extends CI_Model {
  /**
   * Access the parent methods
   */
  function __construct() {
    parent::__construct();

  }

  /**
   * Set the name of the permanent cookie
   *
   * @var string
   *
   */
  const cookieName = 'bc';

  /**
   * Set expiration time
   *
   * (measured in seconds)
   *
   * @var int
   */
  const expire = 315360000; // == 10 years
      //946080000; == 30 years

  /**
   * The perm cookie data object
   *
   * Everything will be included here
   *
   * This is the source, use $this->$cookData to store
   * session data
   *
   * @abstract
   * @var array
   */
  private $cookDataSource  = array (
      'permId' => 0, // the db record id
      'createDate' => null,
      'lastSeenDate' => null,
      'expiresAt' => null, // when the cookie is set to exire
      'hash' => '', // the hash string stored in the cookie
      'userId' => 0, // if user, store the id
      'isNewUser' => false, // if user is a new user(legacy)
      'userDatetime' => null, // when signed on as a user first time
      'visitCounter' => 0, // how many times user has visited
      'campaign' => '',
      'details' => array(
        'is_referral' => null,
        'referrer' => '',
        'browser' => '',
        'browserVersion' => '',
        'platform' => '',
        'is_mobile' => null,
        'mobile_string' => '',
        'firstIP' => '',
        'landPage' => '',
        'campaign_source' => '',
        'campaign_name' => '',
        'campaign_version' => ''
      ),
      /**
       * An abstract array of boolean valued items that determine
       * if a certain action has happened to that visitor
       *
       */
      'switches' => array(),
      /**
       * An abstract items of AB tests
       *
       */
      'ab' => array()

  );

  /**
   * The metadata JSON string
   *
   *
   * @var string
   */
  private $permMetadata = '';

  /**
   * The session cookie data object
   *
   * @abstract
   * @var array
   */
  private $cookData = array();



  /**
   * Executes when a new visitor comes to our website
   *
   * We will determine if a valid permanent cookie exists
   * and either load it or order to create it.
   *
   * If we don't find a perm cookie (new user) we do not create
   * it on the fly. Rather we give a command to the JS engine
   * once it loads to request for the new cookie to be written.
   *
   * That way we are a bit more secure that the folk at the other side
   * of the line is a browser with JS engine capabilities and we have
   * less clutter from crawlers and bots...
   *
   * @return array The perm cookie data object
   */
  public function newVisitor()
  {
    // get cookData by ref
    $cd = & $this->cookData;

    // check if perm cookie exists
    $cook = $this->input->cookie(self::cookieName);

//die(debug_r($cook));
    if (false === $cook) {
      // doesn't exist, notify JS engine and return dummy object
      $this->main->JsPass(25);
      $cd = $this->cookDataSource;
      return $cd;

    }


    // break cookie value to id and hash
    list($id, $hash) = explode('.', $cook);

    $this->db->select('permId, data, metadata');
    $this->db->where('permId', (int) $id);
    $query = $this->db->get('metrics_permcook');
    if (1 != $query->num_rows()) {
      // we didn't find result... create new
      $this->main->JsPass(25);
      $cd = $this->cookDataSource;
      return $cd;

    }

    // fetch result
    list($res) = $query->result_array();

    $cd = unserialize($res['data']);

    $this->permMetadata = $res['metadata'];


    $this->_validateCookData();



    // check if hash values match
    if ($cd['hash'] != $hash) {
      // don't match, treat as new visitor
      $this->main->JsPass(25);
      $cd = $this->cookDataSource;
      return $cd;

    }

    // now check that we haven't created the perm cook
    // during this session (var set in users controler)
    $jm = $this->session->userdata('justMarried');
    if ($jm)
      return $cd;
    // after this point we have an authed cook data object
    // update proper values and save
    $cd['permId'] = (int) $id;
    $cd['lastSeenDate'] = time();
    $cd['visitCounter']++;



    // update the data back to the db
    $this->db->where('permId', $cd['permId']);
    $this->db->set('lastSeenDatetime', 'now()', false);
    $this->db->set('visitCounter', $cd['visitCounter']);
    $this->db->update('metrics_permcook', array('data' => serialize($cd)));

    $CI = & get_instance();
    $CI->PERMID = $cd['permId'];
    $sd = $this->session->userdata('sessionData');
    $this->load->library('metrics');
    $this->metrics->trackCounter('visit', $sd['referrer'], '-');


    return $cd;

  }

  /**
   * We have a new visitor
   *
   * We will create a record in our DB and store
   * the perm cookie to the user.
   *
   * We return the full cook data object
   *
   * @return array
   */
  public function createNew()
  {
    // Set initial values
    $this->cookData = $this->cookDataSource;
    $cd = & $this->cookData;
    $this->load->library('user_agent');

    // set time
    $cd['lastSeenDate'] = $cd['createDate'] = time();
    // generate random hash
    $cd['hash'] = HashString($this->agent->browser() . $this->agent->platform());
    // set expire after two years
    $cd['expiresAt'] = time() + self::expire;


    // set rest variables
    $cd['visitCounter'] = 1;
    $this->_saveDetails();


    // check if source from campaign
    $this->load->model('campaigns');
    if ($this->campaigns->inCampaign()) {
      // user is from a campaign, get the saved data
      $cd['campaign'] = $this->campaigns->getCampaignString();
    }


    // save the record
    $insert = array(
        'data' => serialize($cd),
        'visitCounter' => 1,
        'referrer' => $cd['details']['referrer'],
        'firstIP' => $cd['details']['firstIP'],
        'userId' => 0,
        'platform' => $cd['details']['platform'],
        'mobile' => $cd['details']['mobile_string'],
        'browserVersion' => $cd['details']['browser']
          . '::' . $cd['details']['browserVersion'],
        'landPage' => $cd['details']['landPage'],
        'userAgent' => $this->agent->agent_string(),
        'campaign' => $cd['campaign']
    );

    $this->db->set('createDatetime', 'now()', false);
    $this->db->set('lastSeenDatetime', 'now()', false);
    $this->db->insert('metrics_permcook', $insert);

    // get the ID
    $cd['permId'] = $id = $this->db->insert_id();

    // prepare cookie parameters...
    $cookValue = $cd['permId'] . '.' . $cd['hash'];

    if ($this->campaigns->inCampaign()) {
      $this->campaigns->savePerm($id);
    }

    $cookie = array(
        'name'   => self::cookieName,
        'value'  => $cookValue,
        'expire' => (string) self::expire,
        'domain' => '.' . GetDomain(),
        'path'   => '/'
    );

    // now store the cookie on the visitor
    $this->input->set_cookie($cookie);

    return $cd;

  }

  /**
   * A simple getter for cookData
   *
   * @return array
   */
  public function getPermData()
  {
    // check if $this->cookData is empty...
    if (!count($this->cookData)) {
      $sessData = $this->session->userdata('sessionData');
      $this->cookData = $sessData['permData'];
    }

    return $this->cookData;
  }

  /**
   * A simple getter for the permdata
   *
   * @return string
   */
  public function getPermMetadata() {
    return $this->permMetadata;
  }

  /**
   * Will merge any differences from our source to the
   * current data object, in effect bringing the
   * data object up to date
   *
   * @param array $opt_path The recursive path in an array
   * @return void
   */
  private function _validateCookData ($opt_path = array())
  {
    // shortcut assign by ref
    $cds = $this->cookDataSource;
    $cd = & $this->cookData;
    // get the differences in an array
    $ar_diff = array_diff_key($cds, $cd);

    // combine the difference
    $cd = array_merge_recursive($cd, $ar_diff);

    // check if details are valid
    if (is_null($cd['details']['is_referral'])) {
      // no details, store them
      $this->_saveDetails();
    }

  }

  /**
   * Store in the currect data object the detail values
   * like referrer, first IP, etc
   *
   * @return void
   */
  private function _saveDetails()
  {

    // load User Agent class
    $this->load->library('user_agent');

    $cd = & $this->cookData;
    $sd = $this->session->userdata('sessionData');

    $cd['details']['is_referral'] = $sd['is_referral'];
    $cd['details']['referrer'] = $sd['referrer'];
    $cd['details']['firstIP'] = $this->input->ip_address();
    $cd['details']['browser'] = $this->agent->browser();
    $cd['details']['browserVersion'] = $this->agent->version();
    $cd['details']['platform'] = $this->agent->platform();
    $cd['details']['landPage'] = $sd['landPage'];
    if ($this->agent->is_mobile()) {
      $cd['details']['is_mobile'] = true;
      $cd['details']['mobile_string'] = $this->agent->mobile();
    }

  }

  /**
   * Execute whenever we have a user login
   *
   * Optionaly let us know if this user is a new one
   *
   * If user logged in for first time for this perm cook
   * then we store the info
   *
   *
   * @param array $userData User data object
   * @param boolean $is_new [optional] set to true if user is new
   * @return void
   */
  public function userLogin($userData, $is_new = false)
  {
    // get current session data
    $sessData = $this->session->userdata('sessionData');

    // check if we have a valid perm cook "session"
    if (0 == $sessData['permData']['permId'])
      return;

    // update the data
    $sessData['permData']['userId'] = $userData['userId'];
    $sessData['permData']['isNewUser'] = $is_new;
    $sessData['permData']['userDatetime'] = time();


    // update the data back to the db
    $this->db->where('permId', $sessData['permData']['permId']);
    $this->db->set('userDatetime', 'now()', false);
    $update = array(
        'data' => serialize($sessData['permData']),
        'userId' => $userData['userId'],
        'isNewUser' => ($is_new ? 1 : 0)
    );
    $this->db->update('metrics_permcook', $update);

    // save the session
    $this->session->set_userdata('sessionData', $sessData);

  }




}

?>