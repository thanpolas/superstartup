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
 * created on Jun 20, 2011
 * campaigns.php 
 *
 */

/**
 * Description of campaigns
 *
 * @author Thanasis Polychronakis <thanpolas@gmail.com>
 */
class Campaigns extends CI_Model{
  function __construct() {
    parent::__construct();
  }

  /**
   * Will save a record in the db and update
   * the current visitor's session data
   *
   * @param string $source
   * @param string $campaign
   * @param string $version
   * @return void
   */
  public function addRecord($source, $campaign, $version)
  {


    $insert = array (
        'source' => $source,
        'campaign' => (string) $campaign,
        'version' => (string) $version,
        'userId' => 0,
        'permId' => $this->PERMID
    );

    $this->db->set('datetime', 'now()', false);

    $this->db->insert('metrics_campaigns', $insert);

    // check if failed
    if (0 >= $this->db->insert_id())
            return;

    // prepare array we will save to session
    $insert['id'] = $this->db->insert_id();
    $insert['jsdone'] = false;
    $this->session->set_userdata('campaignVisitor', true);
    $this->session->set_userdata('campaignData', $insert);


  }


  /**
   * When a campaign visitor creates a user account
   * this method is triggered to update the defined record
   *
   * @param int $userId New saved user id
   * @return void
   */
  public function newuser($userId)
  {
    $cdata = $this->session->userdata('campaignData');
    $this->db->where('id', $cdata['id']);
    $this->db->update('metrics_campaigns', array('userId' => $userId));

  }


  /**
   * Save the perm ID in the campaign table
   * after we have saved the perm ID
   *
   * @param int $permID
   * @return void
   */
  public function savePerm($permID)
  {
    $cdata = $this->session->userdata('campaignData');
    $this->db->where('id', $cdata['id']);
    $this->db->update('metrics_campaigns', array('permId' => $permID));

  }


  /**
   * Let's us know if we are from a campaign
   *
   * @return boolean
   */
  public function inCampaign()
  {

    if ($this->session->userdata('campaignVisitor'))
      return true;

    return false;
  }

  /**
   * Let us now if we should inform analytics
   *
   * @return boolean
   */
  public function notifyAnalytics()
  {
    if (!$this->inCampaign())
      return false;

    $cdata = $this->session->userdata('campaignData');

    if (!$cdata['jsdone']) {
      $cdata['jsdone'] = true;
      $this->session->unset_userdata('campaignData');
      $this->session->set_userdata('campaignData', $cdata);
      return true;
    }
    return false;
  }
  /**
   * Return the campaign we are coming from in a single string
   *
   * @return string
   */
  public function getCampaignString()
  {
    if (!$this->inCampaign())
      return '';

     $campaignData = $this->session->userdata('campaignData');

     return $campaignData['source'] . '-' . $campaignData['campaign']
              . '-' . $campaignData['version'];
  }

	/**
	 * Return the campaign data object
	 *
	 * @return array
	 */
	public function getData()
	{
		if (!$this->inCampaign())
      return array();

 		return $this->session->userdata('campaignData');
	}

}
