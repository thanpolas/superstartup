<?php

/* * ****
 * Based on Fotis Alexandrou source modified and debugged by Thrasos Nerantzis
 * and Thanasis Polychronakis
 *
 * **** */

class User extends CI_Model {

  /**
   * Master indicator if user is authenticated
   *
   * @var boolean
   */
  private $isAuthed = false;

  /**
   * The user's metadata JSON string
   *
   * Should equal with user['metadata']
   *
   * @var string
   */
  private $userMetadata = '';

  /**
   * Our user Data Object. This data object is for internal use
   * only (server side) so we may store however sensitive
   * information we like
   *
   * If we want to expose this data object to the [owning] user
   * then we should use the method: get_public()
   * Where we should 'chop' off any sensitive information stored
   * in the $userData array
   *
   * This array will be overwritten, so the schema here
   * is just for show, documenting what this array contains
   *
   * @var Array
   */
  private $userData = Array();
  private $userConstruct = Array(
      'userId' => 0,
      'nickname' => '',
      'fullname' => '',
      'email' => '',
      'createDate' => '', // date in GMT
      'disabled' => false, // if user is active / disabled
      'hasExtSource' => true, // indicates user has external auth source (FB/TW)
      'firstAuthSourceId' => 0, // the first auth source of the user (entry point)
      'loginCounter' => 0,
      'metadata' => '',
      'metadataObject' => array(),
      'campaignSource' => '',
      'ab_test' => '',
      // optionaly, if user Has an external authentication source
      // we provide a multidimentional array with the sources
      'extSource' => array(
          0 => array(
              'sourceId' => 0,
              'extUserId' => 0,
              'extUrl' => '',
              'extVerified' => true,
              'extUsername' => '',
              'oAuthToken' => '',
              'oAuthTokenSecret' => ''
          )
      ),
      'profile' => array (
          'location' => '',
          'web' => '',
          'bio' => ''
      ),
      'settings' => array(
          'alerts' => array(
              'mentions' => true,
              'frameComments' => true,
              'messages' => true
          )

      )
  );



  /**
   * The public user data object is stored in this array
   *
   * This is produced once the get_public() method is run
   *
   * @var Array
   */
  private $userDataPublic = Array();
  /**
   * This is an even more restricted user data object
   *
   * It is used for storing user data that is not our
   * current user, which means we will enforce our privacy
   * policy and the users' privacy settings
   *
   * $userDataReq and $userData contain equal amount of information
   * about the client. The "censored" objects are stored in the
   * *public* variables.
   *
   * @var Array
   */
  private $userDataReq = Array();
  /**
   * This is where $userDataReq comes to be choped down
   *
   * We contain a limited user data object that contains
   * only user public information available to the world
   *
   * @var Array
   */
  private $userDataPublicReq = array();
  /**
   * This variable will be used to create new users to our system
   *
   * We will follow the schema of our standard user object.
   *
   * The flow allows for any external lib to write on this var
   *
   * However we expect that when the local add() method is called
   * this data array is complete and VALIDATED
   *
   * @var Array
   */
  public $newUserData = Array();

  /**
   * Access the parent methods
   */
  function __construct() {
    parent::__construct();

    //assign default values to the user data object
    $this->userData = $this->userConstruct;
    // assign default values to the new user data object
    $this->newUserData = $this->userData;
  }

  /**
   * Let's us know if current user is Authenticated
   *
   * This should be the entry point to any flow that has
   * to do with user authentication. We load the data objects
   * from the session in this method so it's important
   * that we start from it...
   *
   * @return boolean
   */
  public function isAuthed()
  {
    // first check if we already know user is authed
    if ($this->isAuthed)
      return true;

    // we don't know if we are authed, check the session
    if ($this->session->userdata('isAuthed')) {
      // we are authed, give light
      $this->isAuthed = true;
      $this->userData = $this->session->userdata('userData');
      return true;
    }
    return false;
  }

  /**
   * Will load up the complete user data object
   * for the given query.
   *
   * We can enter ID, nickname, email, or array of either
   * as parameters for this method.
   *
   * If we enter no parameters we assume that we want
   * to pull the currently logged in user's data object
   *
   * By default we get data for other users from the one
   * that is requesting.
   *
   * We do not honor the privacy bit here, check it in the application
   * method level.
   *
   * We store the result[s] in $this->$userDataReq object
   *
   * Optionaly we may request this method to work for
   * user authentication purposes. In this case we store at
   * $this->userData
   *
   * If $mixed is a unique user id from an ext source, then we
   * need to define that source
   *
   * ###
   * ### This method is critical and needs to be
   * ### refactored in more pieces
   * ###
   *
   * @param mixed $mixed [optional] user ID (has to be numeric), nickname or e-mail
   * @param boolean $for_auth [optional]
   * @param int $opt_source_id defines what source we are querying against (if ID's are from FB/TW)
   * @param boolean $opt_load_profile [optional] If we want to load the user's profile
   * @return array|boolean User object[s] or false if no results
   */
  public function get($mixed = null, $for_auth = false, $opt_source_id = SOURCE_WEB
              , $opt_load_profile = false) {
    $is_array = false;

    // lock loading user profile to true for now...
    // we need profile info everywhere
    $opt_load_profile = true;

    //check if array first
    if (is_array($mixed)) {
      $is_array = true;
      $firsttime = true;
      $query_value = array();
      foreach ($mixed as $k => $v) {
        //typical first time loop situation
        if ($firsttime) {
          $query_what = $this->_getQueryWhat($v);
          $firsttime = false;
          //assign to value array
          $query_value[] = $v;
        } else {
          //check if different query type
          if ($query_what <> $this->_getQueryWhat($v)) {
            raise_error('Something failed, please retry', 'Different query types');
            return false;
          }
          //assign to value array
          $query_value[] = $v;
        } // else not for first time in the loop
      } // for each element in parameter array
    } else { // if parameter is array
    //
    //
      // $mixed not an array
      // check if we had any parameters at all
      if (is_null($mixed)) {
        $for_auth = true;
        if (!$this->isAuthed()) {
          raise_error('Something went wrong, please retry', 'user is not authed and we requested an ad-hoc auth user data object', true);
          return false;

        }
      }
      // check if we get for auth purposes and see if we have
      // the result cached
      if ($for_auth) {
        // nice, check if we know we are authed
        if ($this->isAuthed()) {
          // yes we do, we have a data object ready, return it as is...
          return $this->userData;
        }
      }
      // we request a single result
      $query_what = $this->_getQueryWhat($mixed);
      $query_value = $mixed;
    }


    //check if UserId and format the WHERE clause
    if ('userId' <> $query_what) {
      $query_what = 'LOWER(' . $query_what . ')';
    } else {
      $query_what = $query_what;
    }


    // create select statement
    $this->db->select('users.userId, users.nickname, users.real_name,
        users.email, users.date_added, users.disabled, users.authSourceId,
        users.loginCounter, users.new_message, users.new_notifications,
        users.new_notifications_data, users.settings_data, users.metadata
    ');

    /**
     * Now check for source of authentication
     * US / Facebook / Twitter
     *
     */
    switch ($opt_source_id) {
      case SOURCE_WEB:
        // nothing, already done above
        break;
      case SOURCE_FB:
        $this->db->join('users_source', 'users_source.userId = users.userId AND users_source.authSourceId = ' . SOURCE_FB, 'left');
        $query_what = 'users_source.extUserId';
        break;

      case SOURCE_TWIT:
        $this->db->join('users_source', 'users_source.userId = users.userId AND users_source.authSourceId = ' . SOURCE_TWIT, 'left');
        $query_what = 'users_source.extUserId';
        break;
    }

    // the where clause
    $this->db->where_in($query_what, $query_value);

    if (!$query = $this->db->get('users')) {
      raise_error('Something failed, please retry', 'SQL FAIL On Select for user model get()');
    }



    // get the rows
    $rows = $query->num_rows();

    //check if we had results
    if (!$rows) {
      return false;
    } //if we did not have results


    /**
     * We have one result or many results
     *
     * We will store the values in the appropriate
     * data object
     *
     */
    if (1 < $rows) {
      // we shouldn't be here if we are for auth purposes...
      if ($for_auth) {
        //TODO try to fix that on the fly by removing records / resolving
        // the bogus situation
        raise_error('Something went wront, please retry', 'Serious flaw, multiple results when query for auth');
      }

      // go through all the results
      $all_user_ids = array();
      // reset our data object container
      $this->userDataReq = array();
      foreach ($query->result_array() as $v) {
        // clean null values (make them a string)
        $v = MY_DB::removeNull($v);

        // store user's ID
        $all_user_ids[] = $v['userId'];

        // assign to data object
        $this->_assignUser($this->userDataReq[$v['userId']], $v);
      }

      // now load and merge external auth sources
      $this->_loadMultipleExtSources($this->userDataReq, $all_user_ids);

      // check if we want profile and load it
      if ($opt_load_profile || $for_auth)
        $this->_loadMultipleProfiles($this->userDataReq, $all_user_ids);

      return $this->userDataReq;
    } else {
      // one result
      list($res) = $query->result_array();
      $query->free_result();

      // check if we have a request for another user
      if (!$for_auth) {
        // other user request
        // reset request objects
        $this->userDataReq = array();
        $this->_assignUser($this->userDataReq[$res['userId']], $res);
        // TODO Future implement this, when we have a native signup
        // the hasExtSource switch will tell us if user has FB/TW linked
        //if ($this->userDataReq['hasExtSource'])
        // ...but until then, since we only support FB/TW signups we auto-load
        $this->_loadExtSources($this->userDataReq[$res['userId']], $res['userId']);
        // check if we want profile and load it
        if ($opt_load_profile)
          $this->_loadProfile($this->userDataReq[$res['userId']], $res['userId']);


        // return
        return $this->userDataReq;
      } else {
        // We ask this for authentication purposes, fill in
        // our currently logged in user's data object

        // reset userData's extSource
        $this->userData['extSource'] = array();

        $this->_assignUser($this->userData, $res);

        // store the metadata on our class var as well
        $this->userMetadata = $res['metadata'];

        // same situation as above comments
        //if ($this->clsDobj->user['hasExtSource'])
        $this->_loadExtSources($this->userData, $res['userId']);
        $this->_loadProfile($this->userData, $res['userId']);
        // return
        return $this->userData;
      }
    } // else we had a single result


  }


  /**
   * Shortcut method to get currently logged in
   * user's nickname
   *
   * @return string
   */
  public function getNickname()
  {
    if ($this->isAuthed())
      return $this->userData['nickname'];

    return '';
  }
  /**
   * Shortcut method to get currently logged in
   * user's ID
   *
   * @return int
   */
  public function getID()
  {
    if ($this->isAuthed())
      return $this->userData['userId'];

    return 0;


  }

  /**
   * Function for administrative purposes
   * Returns users for a given range
   *
   * @param type $offset
   * @param type $limit
   * @return type array of user objects
   */
  public function get_all($offset=0, $limit = 0) {
    $sql = "SELECT `id`, `real_name`, `active`, `date_added`, `login_type`
		FROM `users`";

    if ((int) $limit > 0) {
      $sql .= " LIMIT $offset, $limit";
    }

    return $this->db->query($sql)->result();
  }

  /**
   * Returns the user's login type
   *
   * @return type string
   */
  public function get_login_type() {
    if (!is_numeric($this->id) || (int) $this->id <= 0)
      return;
    $sql = "SELECT `login_type` FROM `users` WHERE `id`={$this->id} AND `active`=1 LIMIT 1";
    $res = $this->db->query($sql)->result();

    if (empty($res) || empty($res[0]) || !isset($res[0]->login_type) || $res[0]->login_type == null)
      return;

    return $res[0]->login_type;
  }

  /**
   * Bans a user. Prevents from logging in
   * @return type boolean
   */
  public function ban_user() {
    if (!is_numeric($this->id) || (int) $this->id <= 0)
      return false;
    $sql = "UPDATE `users` SET `active`=0 WHERE `id`={$this->id} LIMIT 1";
    $this->db->query($sql);
    return true;
  }

  /**
   *
   * Will insert a new user in the database.
   * Data has been validated
   *
   * Define our source (web, mobile, fb, twit)
   *
   * @param int $sourceId One of the SOURCE_ constants
   * @return int The new user ID
   */
  public function add($sourceId)
  {
    // first check if we have a referrer stored in the session
    $sessData = $this->session->userdata('sessionData');
    $http_referrer = '';
    if (is_array($sessData))
      if (is_array($sessData['permData']))
        if (is_array($sessData['permData']['details']))
          if (is_string($sessData['permData']['details']['referrer']))
            $http_referrer = $sessData['permData']['details']['referrer'];


    // check if email is set
    if (!isset($this->newUserData['email']))
        $this->newUserData['email'] = '';

    // check for campaign visitor
    $this->newUserData['campaign'] = '';
    $this->load->model('core/campaigns');
    if ($this->campaigns->inCampaign()) {
      // user is from a campaign, get the saved data
      $this->newUserData['campaign'] = $this->campaigns->getCampaignString();
    }

    // check for A/B testing
    $this->newUserData['ab_test'] = '';
    $this->load->model('core/ab_test');
    if ($this->ab_test->inTest()) {
      $this->newUserData['ab_test'] = $this->ab_test->getTest();
    }
    // construct the insert array
    $insert = array(
        'nickname' => $this->newUserData['nickname'],
        'real_name' => $this->newUserData['fullname'],
        'email' => $this->newUserData['email'],
        'hasExtSource' => 1,
        'authSourceId' => $sourceId,
        'http_referrer' => $http_referrer,
        'permId' => $this->PERMID,
        'campaignSource' => $this->newUserData['campaign'],
        'ab_test' => $this->newUserData['ab_test']
    );
    $this->db->set('date_added', 'now()', false);
    // perform the insert
    $this->db->insert('users', $insert);
    // get the new user's ID
    $this->newUserData['userId'] = $this->db->insert_id();

    // now save the user source of signup...
    $this->_saveUserSource($sourceId);

    // check if source is from Twitter and save profile info as well
    if (SOURCE_TWIT == $sourceId) {
      // get received data object from tw
      $ud = $this->newUserData['userData'];

      // secure variables
      if (!isset($ud->location))
        $location = '';
      else
        $location =$ud->location;
      if (!isset($ud->url))
        $url = '';
      else
        $url = $ud->url;
      if (!isset($ud->description))
        $descr = '';
      else
        $descr = $ud->description;
      // set insert array
      $insert = array (
          'userId' => $this->newUserData['userId'],
          'location' => $location,
          'web' => $url,
          'bio' => Valid::RipString($descr, 140),
          'userEditCount' => 0
      );
      $this->db->insert('users_info', $insert);
    }

    // if in campaign, save back...
    // update our campaigns table
    if ($this->campaigns->inCampaign())
      $this->campaigns->newuser($this->newUserData['userId']);


    return $this->newUserData['userId'];
  }





  /**
   * Makes the actual result assignment to the user
   * data object. Note that we pass by reference so
   * that we write on the right object (user / users)
   * whatever the calee passes
   *
   * @author Thanasis Polychronakis <thanasisp@gmail.com>
   * @param array $user By reference the user object we want to fill
   * @param array $res The DB result
   * @return void
   */
  private function _assignUser(&$user, $res) {


    $user['userId'] = (int) $res['userId'];
    $user['nickname'] = $res['nickname'];
    $user['fullname'] = $res['real_name'];
    $user['email'] = $res['email'];
    $user['createDate'] = $res['date_added'];
    $user['disabled'] = (0 == $res['disabled'] ? false : true);
    $user['hasExtSource'] = true;
    $user['firstAuthSourceId'] = (int) $res['authSourceId'];
    $user['loginCounter'] = (int) $res['loginCounter'];
    $user['newMessage'] = (int) $res['new_message'];
    $user['newNotifications'] = (int) $res['new_notifications'];
    $user['newNotificationsData'] = unserialize($res['new_notifications_data']);
    $user['settings'] = unserialize($res['settings_data']);
    $user['metadata'] = $res['metadata'];

    // check if settings where filled correctly (had data)
    if (false === $user['settings']) {
      // no they weren't grab default...
      $user['settings'] = $this->userConstruct['settings'];

    }
    return;
    /**
     * The full monty as seen in geowarp
     *
     * Only for reference reasons, delete after Aug 2011
     *
     *

      $user['password'] = $res['Password'];
      $user['timezone'] = $res['Timezone'];
      $user['verified'] = (0 == $res['Verified'] ? false : true);
      $user['loginAttempts'] = $res['LoginAttempts'];
      $user['disabled'] = (0 == $res['Disabled'] ? false : true);
      $user['disabledReason'] = $res['DisabledReason'];
      $user['email'] = $res['Email'];
      $user['fullname'] = $res['Fullname'];
      $user['createDate'] = dttz($res['CreateDate']);
      $user['lastLoginDate'] = dttz($res['LastLoginDate']);
      $user['lastLoginIp'] = $res['LastLoginIp'];

      $user['userPrivate'] = (0 == $res['UserPrivate'] ? false : true);
      $user['userDataRaw'] = $res['UserData'];
      $user['userData'] = $res['UserDataResolved'];

      $user['emailVerified'] = (0 == $res['EmailVerified'] ? false : true);
      $user['firstSourceCoreId'] = $res['FirstSourceCoreId'];
      $user['hasNativeAccount'] = (0 == $res['HasNativeAccount'] ? false : true);
      $user['hasExtSource'] = (0 == $res['HasExtSource'] ? false : true);
      $user['locale'] = $res['Locale'];

      $user['details'] = array(
      'homepage' => $res['Homepage'],
      'location' => $res['Location'],
      'userBio' => $res['UserBio'],
      'hits' => (int) $res['hits']
      );




      $user['photo'] = array(
      'photoId' => $res['UserPhotoId'],
      'url' => ($res['Filename'] ? __WEB_DIR_ABS_PHOTOS_USERS . $res['DirectoryCounter'] . $res['Filename'] : PHOTO_NOPHOTO_USER_BIG),
      'width' => ((int) $res['Width'] ? (int) $res['Width'] : 73),
      'height' => ((int) $res['Height'] ? (int) $res['Height'] : 73),
      'tUrlBig' => ($res['Filename'] ? __WEB_DIR_ABS_PHOTOS_USERS . $res['tDirectoryCounter'] . $res['tFilename1'] : PHOTO_NOPHOTO_USER_BIG),
      'tUrlNormal' => ($res['Filename'] ? __WEB_DIR_ABS_PHOTOS_USERS . $res['tDirectoryCounter'] . $res['tFilename2'] : PHOTO_NOPHOTO_USER_NORMAL),
      'tUrlMini' => ($res['Filename'] ? __WEB_DIR_ABS_PHOTOS_USERS . $res['tDirectoryCounter'] . $res['tFilename3'] : PHOTO_NOPHOTO_USER_MINI),
      'tUrlProfile' => ($res['Filename'] ? __WEB_DIR_ABS_PHOTOS_USERS . $res['tDirectoryCounter'] . $res['tFilename4'] : PHOTO_NOPHOTO_USER_LARGE)
      );
     *
     */
    // method _assignUser()
  }

  /**
   * We will attempt to load external
   * sources for the user
   *
   *
   * @author Thanasis Polychronakis <thanasisp@gmail.com>
   *
   * @param array $user The user data object we need to update
   * @param int $userId db user id
   * @return void
   */
  private function _loadExtSources(&$user, $userId)
  {
    $this->db->select('usersSourceId, authSourceId, extUserId, extVerified, extUrl,
        		extUsername, oAuthToken, oAuthTokenSecret, extProfileImageUrl');

    $this->db->where('userId', $userId);

    if (!$query = $this->db->get('users_source')) {
      raise_error('Something failed, please retry', 'SQL FAIL On Select for user model _loadExtSources()');
    }

    // get the rows
    $rows = $query->num_rows();

    //check if we had results
    if (!$rows) {
      return;
    } //if we did not have results


    $res = MY_DB::getResultArray($query);
    $user['extSource'] = array();


    foreach ($res as $source) {
      // skip native sources
      if (SOURCE_WEB == $source['authSourceId'] || SOURCE_MOB == $source['authSourceId'])
        continue;

      $user['extSource'][] = array(
          'sourceId' => (int) $source['authSourceId'],
          'extUserId' => $source['extUserId'],
          'extUrl' => $source['extUrl'],
          'extVerified' => (0 == $source['extVerified'] ? false : true),
          'extUsername' => $source['extUsername'],
          'oAuthToken' => $source['oAuthToken'],
          'oAuthTokenSecret' => $source['oAuthTokenSecret'],
          'extProfileImageUrl' => $source['extProfileImageUrl']
      );
    }

    return;

    // method _loadExtSources()
  }


  /**
   * Will load external authentication sources for multiple
   * users and assign them to the given $user data object
   *
   * @param array $user A standard user data object (containing multipe data objects)
   * @param array $all_user_ids A single dimention array containing all the native userId
   * @return void
   */
  private function _loadMultipleExtSources (&$user, $all_user_ids)
  {
    $this->db->select('userId, authSourceId, extUserId, extUrl,
        		extUsername, extProfileImageUrl');

    $this->db->where_in('userId', $all_user_ids);

    if (!$query = $this->db->get('users_source')) {
      raise_error('Something failed, please retry', 'SQL FAIL On Select for user model _loadExtSources()');
    }

    // get the rows
    $rows = $query->num_rows();

    //check if we had results
    if (!$rows) {
      return;
    } //if we did not have results

    // go for each result
    foreach ($query->result_array() as $res) {
      // check if we can locate this user in the user object provided
      if (!isset($user[$res['userId']]))
        continue;
      // assign by ref for better handling
      $u = & $user[$res['userId']];
      if (!isset($u['extSource'])) {
        // doesn't exist, create
        $u['extSource'] = array();
      }

      // append the source now...
      $u['extSource'][] = array (
          'sourceId' => (int) $res['authSourceId'],
          'extUserId' => $res['extUserId'],
          'extUrl' => $res['extUrl'],
          'extUsername' => $res['extUsername'],
          'extProfileImageUrl' => $res['extProfileImageUrl']
      );

    }
    return;

  }

  /**
   * Loads user profiles for multiple users
   *
   * @param array $users reference by assignment for user data object
   * @param array $all_user_ids An array of itnegeres
   * @return void
   */
  private function _loadMultipleProfiles (&$users, $all_user_ids)
  {
    $this->db->select('userId, location, web, bio');

    $this->db->where_in('userId', $all_user_ids);

    if (!$query = $this->db->get('users_info')) {
      raise_error('Something failed, please retry', 'SQL FAIL On Select for user model _loadMultipleProfiles()');
    }

    // get the rows
    $rows = $query->num_rows();

    //check if we had results
    if (!$rows) {
      return;
    } //if we did not have results

    // go for each result
    foreach ($query->result_array() as $res) {

      // check for data sanity
      if (!isset($res['userId']))
        continue;
      // check if we can locate this user in the user object provided
      if (!isset($users[$res['userId']]))
        continue;
      // assign by ref for better handling
      $u = & $users[$res['userId']];
      // start assigning
      $u['profile']['location'] = $res['location'];
      $u['profile']['web'] = $res['web'];
      $u['profile']['bio'] = $res['bio'];
    }
    return;
  }


  /**
   * Will load and assign a user's profile information
   * in the data object provided
   *
   * @param array $user Reference by assignment for user data object
   * @param int $userId The user id of the user we want to load the profile for
   * @return void
   */
  private function _loadProfile(&$user, $userId)
  {
    $this->db->select('location, web, bio');

    $this->db->where('userId', $userId);

    if (!$query = $this->db->get('users_info')) {
      raise_error('Something failed, please retry', 'SQL FAIL On Select for user model _loadProfile()');
    }

    // get the rows
    $rows = $query->num_rows();

    //check if we had results
    if (!$rows) {
      return;
    } //if we did not have results

    list($res) = $query->result_array();
    // start assigning
    $user['profile']['location'] = $res['location'];
    $user['profile']['web'] = $res['web'];
    $user['profile']['bio'] = $res['bio'];

  }

  /**
   * Returns the user data object cleaned by any sensitive
   * information for use by it's owner.
   *
   * We also put it inside the master property: 'user'
   *
   * If we want to send this information to a third party user
   * then an additional cleaning must happen. We can request
   * that additional cleaning by setting the optional parameter
   * opt_third_party to true
   *
   * @author Thanasis Polychronakis <thanasisp@gmail.com>
   * @param array $opt_userObj [optional] Supply a user object to parse. Default is authed user
   * @param boolean $opt_third_party [optional] If we will expose a data object to a third party (user)
   * @return array|false User's data object or false if fail
   */
  public function get_public($opt_userObj = false, $opt_third_party = false) {
    // check if we have a user object set
    if (is_array($opt_userObj)) {
      $this->userDataPublicReq = $opt_userObj;
      $user = & $this->userDataPublicReq;
    } else {
      if (!$this->isAuthed())
        return false;
        //raise_error('You need to be logged in');
      else {
        $this->userDataPublic = $this->userData;
        $user = & $this->userDataPublic;
      }
    }


    // check if $user is a single or multy data object
    if (isset($user['disabled'])) {
      // it's single

      // start removing sensitive / system fields
      unset($user['disabled']);
      unset($user['firstAuthSourceId']);
      unset($user['metadata']);
      unset($user['campaignSource']);
      unset($user['ab_test']);


      if ($opt_third_party) {
        unset($user['settings']);
        unset($user['email']);
        unset($user['newNotifications']);
        unset($user['newNotificationsData']);
        unset($user['newMessage']);
        unset($user['loginCounter']);
        unset($user['disabled']);
        unset($user['loginCounter']);
        unset($user['metadataObject']);
      }


      // check for external sources and remove sensitive fields
      if ($user['hasExtSource']) {
        foreach ($user['extSource'] as $k => $source) {
          unset($user['extSource'][$k]['oAuthTokenSecret']);
          if ($opt_third_party) {
            unset($user['extSource'][$k]['oAuthToken']);
            unset($user['extSource'][$k]['extVerified']);

          }

        }
      }
    } else {
      // multiple
      foreach($user as $key => $value) {

        // start removing sensitive fields
        unset($user[$key]['disabled']);
        unset($user[$key]['firstAuthSourceId']);
        unset($user[$key]['metadata']);
        unset($user[$key]['campaignSource']);
        unset($user[$key]['ab_test']);


        if ($opt_third_party) {
          unset($user[$key]['settings']);
          unset($user[$key]['email']);
          unset($user[$key]['newMessage']);
          unset($user[$key]['loginCounter']);
          unset($user[$key]['disabled']);
          unset($user[$key]['loginCounter']);
          unset($user[$key]['newNotifications']);
          unset($user[$key]['newNotificationsData']);
          unset($user[$key]['metadataObject']);
        }

        // check for external sources and remove sensitive fields
        if ($user[$key]['hasExtSource'] && isset($user[$key]['extSource'])) {
          foreach ($user[$key]['extSource'] as $k => $source) {
            unset($user[$key]['extSource'][$k]['oAuthTokenSecret']);
            if ($opt_third_party) {
              unset($user[$key]['extSource'][$k]['oAuthToken']);
              unset($user[$key]['extSource'][$k]['extVerified']);

            }

          }
        }
      }
    }


    return $user;

    // get public
  }

// method get_public

  /**
   * Determines what type of data our parameter input is.
   *
   *  We return one of:
   *  - userId
   *  - nickname
   *  - email
   * @author Thanasis Polychronakis <thanasisp@gmail.com>
   *
   * @param mixed $what
   * @return string
   */
  private function _getQueryWhat($what) {


    /**
     * Check against ID, hopefully a nickname of "123" will
     * evaluate as a string, check that...
     *
     */
    if (is_numeric($what)) {
      return 'userId';
    }

    //check if we have a @ in the string
    if (preg_match('/@/', $what)) {
      return 'email';
    } else {
      return 'nickname';
    }

    // method getQueryWhat
  }

  /**
   * Generate a unique nick as close to
   * provided piece as possible
   *
   * @param string $piece Anything to try something unique on
   * @return string|boolean false if fail
   */
  public function getNewNick($piece) {


    // check if the piece provided passes as a nick
    $piece = Valid::CheckNick(array('nickname' => $piece), false);
    if (is_string($piece)) {
      $realpiece = $piece;
    } else {
      $realpiece = 'newuser_' . mt_rand(10, 9999);
    }



    // first pass check
    if (!$this->nickExists($realpiece)) {
      return $realpiece;
    }

    // nope, get into loop
    $counter = 0;
    $stepA = false;
    $stepB = false;
    $stepC = false;
    $saltChars = array('_', '__', '-', '--', '_-');

    // dive dive dive
    while (true) {

      $trypiece = $realpiece . mt_rand(10, 9999);

      if (!$this->nickExists($trypiece)) {
        return $trypiece;
      }


      // check if 10 passes and still no luck
      if (10 < $counter && !$stepA) {
        $stepA = true;
        // salt the realpiece a bit
        $realpiece = $realpiece . $saltChars[mt_rand(0, 4)];
      }
      // check if 10 passes and still no luck
      if (20 < $counter && !$stepB) {
        $stepB = true;
        // salt the realpiece a bit
        $realpiece = $realpiece . $saltChars[mt_rand(0, 4)];
      }
      // check if 10 passes and still no luck
      if (30 < $counter && !$stepC) {
        $stepC = true;
        // salt the realpiece a bit
        $realpiece = $realpiece . $saltChars[mt_rand(0, 4)];
      }


      // secure from infinite (?!) loop
      if (100 < $counter) {
        //logEvent(1023, 0, 'Reached 100 attempts to get a NEW NICKNAME. Quiting');
        raise_error('Something failed, please retry', 'Failed to get a Unique new nickname');
        return false;
      }
      $counter++;
      // sleep for a while...
      usleep(55);
    }



    // method getNewNick
  }

  /**
   * Checks the user db if this nickname already exists
   *
   * @param string $nickname
   * @return boolean True if nick exists
   */
  public function nickExists($nickname) {

    $nickname = strtolower($nickname);

    $this->db->select('userId');
    $this->db->where('LOWER(nickname)', $nickname);

    if (!$q = $this->db->get('users')) {
      raise_error('Something failed, please retry', 'On select for user model nickExists()');
      return false;
    }

    if ($q->num_rows())
      return true;

    return false;

    // method nickExists
  }

  /**
   * Checks the user db if this email already exists
   *
   * @param string $email
   * @return boolean True if nick exists
   */
  public function emailExists($email) {

    $email = strtolower($email);

    $this->db->select('userId');
    $this->db->where('LOWER(email)', $email);

    if (!$q = $this->db->get('users')) {
      raise_error('Something failed, please retry', 'On select for user model emailExists()');
      return false;
    }

    if ($q->num_rows())
      return true;

    return false;

    // method emailExists
  }


  /**
   * Execute this function whenever current logged in
   * user has modified own information (nick, email, anything)
   *
   * What we do in essence is to load the user data object
   * from the DB again and save it on the session
   *
   * @return void
   */
  public function updateUser()
  {

    // to force get to load from DB we need to set
    // our local var is_authed to false
    $this->isAuthed = false;
    // also reset the session var...
    $this->session->set_userdata('isAuthed', false);

    // now force get to load user data from db
    $this->get($this->userData['userId'], true);

    // and re-apply them on the session
    $this->session->set_userdata('userData', $this->userData);
    $this->session->set_userdata('isAuthed', true);
  }


  /**
   * Create users_source record for the source
   * the user has registered from or logged in
   * or linked account
   *
   * @param int $sourceId
   * @return boolean
   */
  private function _saveUserSource($sourceId)
  {


    // get a ref copy of the new user data object
    $user = & $this->newUserData;

    $userId = $user['userId'];

    if (!isset($user['userData']))
      $userData = array();
    else
      $userData = $user['userData'];

    // First of, get user record from DB (to check if it's written ok)
    $userRes = $this->get($userId, true);



    // construct basic insert array
    $insert = array(
        'authSourceId' => $sourceId,
        'userId' => $userId,
        'extUserId' => 'null',
        'extVerified' => 0,
        'extUrl' => 'null',
        'extUsername' => 'null',
        'extProfileImageUrl' => 'null',
        'extDataObject' => 'null'
    );



    // now based on sourceId tinker with fields
    switch ($sourceId) {
      case SOURCE_WEB:
      case SOURCE_MOB:
        $insert['extUserId'] = $userId;
        $insert['extVerified'] = 1;
        $insert['extUrl'] = '';
        break;

      case SOURCE_FB:
        $insert['extUserId'] = $userData['id'];
        $insert['extVerified'] = ($userData['verified'] ? 1 : 0);
        $insert['extUrl'] = $userData['link']; //sq($eye_db->SecureSQLInject($clsSession->clsfb->getProfileUrl()));
        $insert['extUsername'] = $userData['name'];
        $insert['extDataObject'] = serialize($userData);
        //$insert['ExtUsername'] = sq($clsSession->clsfb->);
        $insert['extProfileImageUrl'] = $userData['profileImageUrl'];

        break;
      case SOURCE_TWIT:
        $insert['extUserId'] = $userData->id;
        $insert['extUrl'] = 'http://twitter.com/' . $userData->screen_name;

        $insert['extVerified'] = ($userData->verified ? 1 : 0);
        $insert['extUsername'] = $userData->screen_name;

        $tokens = $this->tweet->get_tokens();

        $insert['oAuthToken'] = $tokens['oauth_token'];
        $insert['oAuthTokenSecret'] = $tokens['oauth_token_secret'];

        // save profile image
        $insert['extProfileImageUrl'] = $userData->profile_image_url;

        // for twitter $userData is an object (not an array), for this reason we
        // have to put secure sql inject after the serialize
        $insert['extDataObject'] = serialize($userData);
        break;
    }

    //print_r($insert);

    $this->db->set('createDatetime', 'now()', false);
    if (!$this->db->insert('users_source', $insert)) {
      raise_error('An error occured, please retry', 'On Insert for user model._saveUserSource users_source');
      //$eye_db->SQLLog('#1800::On Insert for UserDataEngine.SaveUserSource user_source');
      return false;
    }

    /**
     * For facebook or twitter we also update the has ext source
     *
     * Not yet, we only support FB/TW anyway...
     *
    if ($sourceId <> SOURCE_WEB && $sourceId <> SOURCE_MOB) {

      // update the main user table as well
      $update = array(
          'hasExtSource' => 1
      );
      if (!$eye_db->UpdateArray('user', $update, 'UserId = ' . $userId)) {
        $Err->err(40, $this->lang['register']['fail'], 'DB Error #1801');
        $eye_db->SQLLog('#1801::On Update for UserDataEngine.SaveUserSource user');
        return false;
      }
     *
     */

      // update the user data object with the
      // new data now...
      $this->userData['hasExtSource'] = true;

      switch ($sourceId) {
        case SOURCE_TWIT:
          $this->userData['extSource'][] = array(
              'sourceId' => $sourceId,
              'extUserId' => $userData->id,
              'extUrl' => $userData->url, //$user['userUrl'],
              // FIXME EXT VERIFIED
              'extVerified' => 1,
              'extProfileImageUrl' => $userData->profile_image_url
          );
          break;
        case SOURCE_FB:
          $this->userData['extSource'][] = array(
              'sourceId' => $sourceId,
              'extUserId' => $userData['id'],
              'extUrl' => $userData['link'],
              'extVerified' => $userData['verified'],
              'extProfileImageUrl' => $userData['profileImageUrl']
          );
          break;
      }
    //} (if we are in FB/TW but we can only be here for now...
    return true;

  // method saveUserSource
  }



  /**
   * Performs a login for the current user
   *
   * We expect to have checked everything, we store
   * the user data object, id and login type...
   *
   * @param int $user_id The native DB id
   * @param int $sourceId one of SOURCE_* values
   * @param boolean $newuser Set to true if this is a new user
   * @return void
   */
  public function login($user_id, $sourceId, $newuser)
  {

    // current flow obliges that we have the complete
    // user data object in $this->userData

    if (!is_numeric($this->userData['userId'])) {
      raise_error('Something went wrong, please retry', '$this->userData is not valid');
    }



    $this->isAuthed = true;

    // do a get() so we fill our $this->userData correctly
    $this->get();



    // check if we have not logged in for today and increase the login counter
    $this->db->select('userId, createDatetime');
    $this->db->where('userId', $user_id);
    $this->db->where('category', 'auth');
    $this->db->where('action', 'login');
    $this->db->order_by('metricsCountersId', 'DESC');
    $this->db->limit(1);
    $query = $this->db->get('metrics_counters');

    if (0 >= $query->num_rows()) {
      // no records, first time login, increase by one
      $this->_increaseLoginCounter($user_id);
    } else {
      // check if date different than today...
      $today = time();
      list($res) = $query->result_array();
      $lastDate = strtotime($res['createDatetime']);
      $year = date('Y', $today);
      $month = date('m', $today);
      $day = date('d', $today);
      $newYear = date('Y', $lastDate);
      $newMonth = date('m', $lastDate);
      $newDay = date('d', $lastDate);

      // perform checks
      if ($year != $newYear) {
        $this->_increaseLoginCounter($user_id);
      } elseif ($month != $newMonth) {
        $this->_increaseLoginCounter($user_id);
      } elseif ($day != $newDay) {
        $this->_increaseLoginCounter($user_id);
      }
    }

    // reset notifications
    $this->load->model('core/notify');
    $this->notify->clear();

    // notify perm cook data
    $this->load->model('core/userperm');
    $this->userperm->userLogin($this->userData, $newuser);

    // notify metadata model
    $this->load->model('core/metadata');
    $this->userData['metadataObject'] = $this->metadata->updateData($this->userData['metadata']);

    // save the metrics
    $this->load->library('core/metrics');
    $this->metrics->trackCounter('auth', 'login', $sourceId);

    // save the session
    $this->session->set_userdata('isAuthed', true);
    $this->session->set_userdata('userData', $this->userData);



  }

  /**
   * Log out currently logged in user
   *
   * Reset all data
   *
   * @return void
   */
  public function logout ()
  {
    // save the metrics
    $this->load->library('core/metrics');
    $this->metrics->trackCounter('auth', 'logout');
    // reset session data
    $this->session->set_userdata('isAuthed', false);
    $this->session->set_userdata('userData', array());

    $this->isAuthed = false;

  }

  /**
   * Increase the login counter of a user
   *
   * @param int $user_id
   * @return void
   */
  private function _increaseLoginCounter($user_id)
  {
    $this->db->where('userId', $user_id);
    $this->db->set('loginCounter', 'loginCounter + 1', false);
    $this->db->update('users');
  }


  /**
   * Set a value to a key in our user data object
   * that is stored in our session
   *
   * @param string $key The key value of the userData object
   * @param mixed $value Any arbitrary value
   * @return void
   */
  public function setSession($key, $value)
  {
    $userData = $this->session->userdata('userData');
    $userData[$key] = $value;
    $this->session->set_userdata('userData', $userData);
  }


  /**
   * Simple getter for metadata
   *
   *
   * @return string
   */
  public function getUserMetadata()
  {
    return $this->userMetadata;
  }

// Model user
}

?>