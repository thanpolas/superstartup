<?php
if (!defined('BASEPATH'))
  exit('No direct script access allowed');

require APPPATH . 'libraries/core/User/TWapi/tweetAPI.php';

class MY_tweet extends tweet {

  private $ci = null;


  /**
   *
   * The data object for tweeter user.
   *
   * Note it's an object, not an Array!
    stdClass Object
    (
        [id_str] => 147388599
        [listed_count] => 0
        [verified] =>
        [profile_text_color] => 333333
        [protected] => 1
        [profile_sidebar_fill_color] => DDEEF6
        [name] => geo develd dÎ´Î»Î¹Î½Î³
        [notifications] =>
        [profile_background_tile] =>
        [favourites_count] => 0
        [profile_image_url] => http://a0.twimg.com/profile_images/925487717/IMG_0755_normal.jpg
        [utc_offset] => -18000
        [location] => Athens, Greece
        [default_profile_image] =>
        [show_all_inline_media] =>
        [geo_enabled] =>
        [profile_link_color] => 0084B4
        [description] => Your Spots! Live, Anywhere!
    and then some more
        [screen_name] => geodevel
        [contributors_enabled] =>
        [lang] => en
        [profile_sidebar_border_color] => C0DEED
        [url] => http://geowarp.com
        [status] => stdClass Object
            (
                [id_str] => 54748058331779073
                [in_reply_to_status_id] =>
                [text] => I just requested an invite code for #geowarp! Join me now http://t.co/DGMP0e6 via @geowarp
                [in_reply_to_user_id] =>
                [retweet_count] => 0
                [place] =>
                [favorited] =>
                [in_reply_to_status_id_str] =>
                [id] => 5.47480583318E+16
                [created_at] => Mon Apr 04 03:32:08 +0000 2011
                [in_reply_to_screen_name] =>
                [truncated] =>
                [source] => Tweet Button
                [in_reply_to_user_id_str] =>
                [contributors] =>
                [coordinates] =>
                [geo] =>
                [retweeted] =>
            )

        [is_translator] =>
        [time_zone] => Quito
        [follow_request_sent] =>
        [statuses_count] => 22
        [profile_use_background_image] => 1
        [created_at] => Mon May 24 01:06:37 +0000 2010
        [friends_count] => 23
        [followers_count] => 2
        [id] => 147388599
        [profile_background_color] => C0DEED
        [default_profile] => 1
        [profile_background_image_url] => http://a0.twimg.com/images/themes/theme1/bg.png
        [following] =>
    )

   *
   * This object will be stored in this variable
   * @var Array
   */
  private $userData = array();

  function __construct() {
    parent::__construct();
    $this->ci = & get_instance();
  }




  /**
   * Wrapper for tweeter's API logged_in method
   *
   * @return boolean
   */
  public function is_connected() { return $this->logged_in();}

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
      raise_error('Something went wrong, please retry','We want to register user via TW but user is not connected to FB');
      return false;
    }

    // shortcut assign the new user data object of the user model
    $newuser = & $this->ci->user->newUserData;


    // try to get a new random and unique nickname for the user
    if (!$newuser['nickname'] = $this->ci->user->getNewNick($this->userData->screen_name)) {
      raise_error('Something failed, please retry', 'clsMain->getNewNick was not fruitfull for TW, failed');
      return false;
    }

    // good, start assigning
    $newuser['fullname'] = $this->userData->name;
    

    // this is a custom ad-hoc field we will use to store the
    // complete FB user data object in the newuser data object...
    $newuser['userData'] = $this->userData;


    return true;

    // method newUser
  }

  /**
   * Will query and return the complete twitter user
   * data object
   *
   *
   * @return object
   */
  public function loadUserObject()
  {
    $this->userData = $this->call('get', 'account/verify_credentials');
    return $this->userData;
  }

// class Citweet
}
?>