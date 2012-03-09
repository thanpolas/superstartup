<?php

if (!defined('BASEPATH'))
  exit('No direct script access allowed');

include_once APPPATH . 'libraries/User/FBapi/fbexception.php';
require APPPATH . 'libraries/User/FBapi/facebook.php';

class Fb {

  private $ci = null;
  public $client = null;
  private $user_id = null;

  /**
   *
   * The object returned from fb (/me)
   *
    Array
    (
        [id] => 817295129
        [name] => Than Polas
        [first_name] => Than
        [last_name] => Polas
        [link] => http://www.facebook.com/profile.php?id=817295129
        [bio] => I am the bright lighthouse of reality *** REQUIRES EXTRA PERM
        [email] => babbos@gmail.com *** REQUIRES EXTRA PERM
        [timezone] => 3
        [locale] => en_US
        [verified] => 1 *** Does not exist in every account! There's an issue here
        [updated_time] => 2009-10-31T00:33:54+0000
    )
   *
   * This object will be stored in this variable
   * @var Array
   */
  private $userData = null;
  private $session = null;
  private $req_perms = '';
  /**
   * Switch that determines if we are connected to FB
   *
   * @var boolean
   */
  private $isConnected = false;

  function __construct() {
    $this->ci = & get_instance();

    $this->ci->load->config('facebook');

    $app_id = $this->ci->config->item('facebook_app_id');
    $api_key = $this->ci->config->item('facebook_api_key');
    $secret_key = $this->ci->config->item('facebook_secret');
    /*
     * All perms
     * user_about_me,user_activities,user_birthday,user_education_history,user_events,user_groups,user_hometown,user_interests,user_likes
      user_location,user_notes,user_online_presence,user_photo_video_tags,user_photos,user_relationships,user_relationship_details,
      user_religion_politics,user_status,user_videos,user_website,user_work_history,email,read_friendlists,read_insights,user_checkins,
      read_mailbox,read_requests,read_stream,xmpp_login,ads_management,user_checkins,publish_stream,create_event,rsvp_event,sms,offline_access,
      publish_checkins,manage_pages
     *
     */

    // We want to reduce user friction, so request a simple
    // authorization first and then request additional permitions
    // as we need them...
    $this->req_perms = 'email,publish_stream';

    $this->client = new Facebook(array(
                'appId' => $app_id,
                'secret' => $secret_key,
                'req_perms' => $this->req_perms,
                'cookie' => true,
            ));


    /**
     *
     * Obsolete [for now] code, there was a problem when
     * we tried to log out the user via FB PHP SDK
     * we now do it over the FB JS SDK so we'll see if that breaks

    //Codeigniter Session & facebook cookies don't get along well
    if ($session) {
      try {

        $this->user_id = $this->client->getUser();

      } catch (FacebookApiException $e) {
        $cookie_name = 'fbs_' . $app_id;
        $dom = '.' . $_SERVER['HTTP_HOST'];
        if (array_key_exists($cookie_name, $_COOKIE)) {
          setcookie($cookie_name, null, time() - 4200, '/', $dom);
          unset($_COOKIE[$cookie_name]);
        }

        if (array_key_exists($cookie_name, $_REQUEST)) {
          unset($_REQUEST[$cookie_name]);
        }

        $cookies = array($api_key . '_expires', $api_key . '_session_key', $api_key . '_ss', $api_key . '_user', $api_key, 'base_domain_' . $api_key);
        foreach ($cookies as $var) {
          if (array_key_exists($var, $_COOKIE)) {
            setcookie($var, null, time() - 4200, '/', $dom);
            unset($_COOKIE[$var]);
          }

          if (array_key_exists($var, $_REQUEST)) {
            unset($_REQUEST[$var]);
          }
        }
      }
    }
     *
     */
  }

  /**
   * Check if we are connected to FB
   *
   * @return boolean
   */
  public function is_connected() {
    // if already checked, return true
    if ($this->isConnected)
        return true;

    // We may or may not have this data on a $_GET or $_COOKIE based session.
    //
    // If we get a session here, it means we found a correctly signed session using
    // the Application Secret only Facebook and the Application know. We dont know
    // if it is still valid until we make an API call using the session. A session
    // can become invalid if it has already expired (should not be getting the
    // session back in this case) or if the user logged out of Facebook.
    $this->session = $this->client->getSession();


    // Session based API call.
    if ($this->session) {
        try {

            // load user data object to check verified bit
            if (!$this->loadUserObject()) {
                return false;
            }

            // make core assignments
            $this->user_id = $this->client->getUser();
            $this->isConnected = true;
        } catch (FacebookApiException $e) {
          raise_error($e);
        }
    }

    return $this->isConnected;
  }

/**
 * Fetch the user data object from Facebook
 *
 * We store the recieved data object in $this->userData
 *
 * @return array
 */
public function loadUserObject()
{
  try {
    // check if already loaded...
    if ($this->isConnected) {
      return $this->userData;
    }
    // reset data
    $this->userData = null;
    $this->isConnected = false;

    // request data using fb API
    $this->userData = $this->client->api('/me');

    if (isset($this->userData['name']))
        $this->isConnected = true;

    /**
     * All types of pictures from FB:
     *
     * square (50x50),
     * small (50 pixels wide, variable height)
     * normal (100 pixels wide, variable height)
     * large (about 200 pixels wide, variable height)
     */

    $picFBUrl = 'http://graph.facebook.com/' . $this->userData['id'];
    $picFBUrl .= '/picture?type=square';


    // FIXME FIXME FIXME FIXME FIXME FIXME FIXME
    // FIXME FIXME FIXME FIXME FIXME FIXME FIXME
    //
    // SERIOUS SHIT - THERE ARE ACCOUNTS WHERE
    // ['user']['verified'] IS NOT SET
    // I AM WORKING ON GETTING AN ANSWER ON THAT
    // UNTIL THIS IS RESOLVED IF VERIFIED IS NOT
    // SET WE CONCIDER THE USER VERIFIED
    //
    //
    // FIXME FIXME FIXME FIXME FIXME FIXME FIXME
    // FIXME FIXME FIXME FIXME FIXME FIXME FIXME

    if (!isset($this->userData['verified'])) {
        $this->userData['verified'] = true;
    }

    $this->userData['profileImageUrl'] = $picFBUrl;

    return $this->userData;
  } catch (FacebookApiException $e) {
    raise_error($e);
  }
}




  function login_url($next = null) {
    if ($next == null)
      $next = current_url();
    return $this->client->getLoginUrl(array('next' => $next, 'display' => 'popup', 'req_perms' => $this->req_perms));
  }

  function logout_url($return = null) {
    if ($return == null)
      $return = current_url;
    return $this->client->getLogoutUrl(array('next' => $return));
  }

  function image_url($uid = null, $large = true) {
    if ($uid == null)
      $uid = $this->user_id;
    return 'http://graph.facebook.com/' . $uid . '/picture' . ($large == true ? '?type=large' : '' );
  }

  function pages() {
    return $this->api('/me/accounts');
  }


  /**
   * Register a new user that signs in via FB
   *
   * We expect that we have checked the user is
   * connected and we have a data object filled
   *
   * This method will create a new nickname for the user
   * and assign known field values for insertion
   *
   * @return boolean
   */
  public function newUser()
  {
    if (!$this->is_connected()) {
      raise_error('Something went wrong, please retry','We want to register user via FB but user is not connected to FB');
      return false;
    }

    // shortcut assign the new user data object of the user model
    $newuser = & $this->ci->user->newUserData;


    // try to get a new random and unique nickname for the user
    if (!$newuser['nickname'] = $this->ci->user->getNewNick($this->userData['first_name'])) {
      raise_error('Something failed, please retry', 'clsMain->getNewNick was not fruitfull, failed');
      return false;
    }

    // good, start assigning
    $newuser['fullname'] = $this->userData['name'];

    // this is a custom ad-hoc field we will use to store the
    // complete FB user data object in the newuser data object...
    $newuser['userData'] = $this->userData;

    $newuser['email'] = $this->userData['email'];

    // now fetch the user's profile image url
    $newuser['profileImageUrl'] = $this->userData['profileImageUrl'];

    return true;

    // method newUser
  }

  // class Fb
}

?>