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
 * created on Sep 27, 2011
 * metadata.php
 *
 */

/**
 * metadata model is about complimentary data that are
 * stored either on the visitor or user level.
 *
 * They contain information like how many times the user
 * has visited us, which tutorials have been displayed and
 * which announcements he / she has seen and generaly ay type of data the
 * client wants to store persistently.
 *
 * When user lands for first time, he/she is not authed, so we
 * pull the metadata from the permcook as a typical visitor.
 *
 * We store the metadata on the session rootkey 'metadataObject'
 * The storing happens in the updateData() method.
 *
 * metadataObject contains variable information based on visitor (times
 * visited, permId, etc) and the 'metadata' key which is a JSON encoded string
 *
 * A first time ever visitor has no permId record until he executes the
 * users/pc (permcook) action... At that moment we pass the metadataObject again
 *
 * If / when a visitor logins / signups we include the new metadataObject
 * object in the user object that we send along, and update our session data.
 *
 * From that point onwards the dominant data object is the one stored in the
 * user's record.
 *
 * This flow needs to change once we'll support 'permanent logged in' users
 * so we can load the user's metadata object on the first page load....
 *
 *
 * @author Thanasis Polychronakis <thanasisp@gmail.com>
 */
class metadata extends CI_Model {

  /**
   * visitor's metadata (tutorials, visits, etc)
   *
   * This is a JSON encoded sting that's managed and handled
   * by the JS engine
   *
   * Metadata are actually stored in two different
   * places. If the user is NOT logged in, we store it
   * in the perm cook table, otherwise we store in the user's table.
   *
   * This is about the perm cook table, the way to tell them apart
   * is with the 'source' key which has a value of 'perm' or 'user'
   *
   * @var string
   */
  private $metadata = '';

  /**
   * This is the actual data object that we send to the client
   *
   * The schema for this object can be seen in the local var
   * $this->metadataObjectSource
   *
   * @var array
   */
  private $metadataObject = array();

  /**
   * The schema of the metadata data object we sent.
   * This object includes variable data that are updated from us (server)
   * and also includes the key metadata which contains the JSON string for the
   * client
   *
   * @var array
   */
  private $metadataObjectSource = array(
      'source' => '', // one of 'perm' or 'user'
      'permId' => 0,
      'createDate' => '',
      'visitCounter' => 0,
      'metadata' => ''
  );


  public function __construct() {
    parent::__construct();
  }

  /**
   * Will save (overwrite) the metadata on the current user or visitor
   *
   *
   * @param string $metadata JSON encoded string
   * @return array metadataObject
   */
  public function save($metadata)
  {
    $update = array ('metadata' => $metadata);

    if ($this->user->isAuthed()) {
      // update user table
      $this->db->where('userId', $this->user->getID());
      $this->db->update('users', $update);
    } else {
      // check if we have a valid perm id
      if (0 == $this->PERMID)
        return;
      $this->db->where('permId', $this->PERMID);
      $this->db->update('metrics_permcook', $update);
    }

    // update our metadataObject and return it
    return $this->updateData($metadata);
  }

  /**
   * Return the metadata
   *
   * Check if we have one, if not construct one
   *
   * Check if we are authed or not, return proper
   *
   * @return string
   */
  public function getMetadata()
  {

    // first check if we already have the metadataObject stored
    if (count($this->metadataObject))
      return $this->metadataObject;

    // next up check if we have value stored in our session
    $this->metadataObject = $this->session->userdata('metadataObject');
    if (count($this->metadataObject) && is_array($this->metadataObject))
      return $this->metadataObject;

    if ($this->user->isAuthed()) {
      $this->metadata = $this->user->getUserMetadata();
    } else {
			$this->load->model('userperm');
      $this->metadata = $this->userperm->getPermMetadata();
    }

    return $this->updateData($this->metadata);
  }

  /**
   * Update the metadataObject with the new metadata
   *
   * Re-compile it (the metadataObject) and store it in our session
   *
   * @param string $metadata [optinal] user's JSON metadata string
   * @return array (metadataObject)
   */
  public function updateData($metadata = '')
  {
    $this->metadata = $metadata;

    // collect required values
    // based on authentication status
    if ($this->user->isAuthed()) {
      $source = 'user';
      $u = $this->user->get();
      $createDate = $u['createDate'];
      $visitCounter = $u['loginCounter'];
    } else {
      $this->load->model('userperm');
      $source = 'perm';
      $permData = $this->userperm->getPermData();

      $createDate = $permData['createDate'];
      $visitCounter = $permData['visitCounter'];
    }

    // cool, we got whatever we got... compile the data object, store and
    // return it
    $this->metadataObject = $this->metadataObjectSource;
    $this->metadataObject['source'] = $source;
    $this->metadataObject['permId'] = $this->PERMID;
    $this->metadataObject['createDate'] = $createDate;
    $this->metadataObject['visitCounter'] = $visitCounter;
    $this->metadataObject['metadata'] = $this->metadata;


    $this->session->set_userdata('metadataObject', $this->metadataObject);

    return $this->metadataObject;
  }
}

?>