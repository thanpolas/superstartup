<?php
/**
 * Handle core user functions
 *
 * This class will wrap any underlying user
 * authentication and management system
 *
 * 3b 23/May/2011
 *
 */

class UserWrap{


  /**
   * Local var that indicates if the user is logged in or not
   *
   * @var boolean
   */
	private static $authed = false;

  /**
   * Because we are a static class we need to store
   * the instanciated user model class in this
   * var so we can talk with the right instance
   *
   * @var User|null
   */
  private static $u = null;

  private static $ci = null;
  /**
   * On load assign the right user model class
   * instance to our static var
   */
  function __construct() {
    self::$ci = & get_instance();
    self::$u = & self::$ci->user;
  }

	/**
	 * Let's us know if current user is Authenticated
	 *
	 * @return boolean
	 */
	public static function isAuthed() {
		return true;//self::$authed;
	}

	/**
	 * If we have an authenticated user, this method returns the
	 * complete user data object
	 *
	 *
	 * @return array|false
	 */
	public static function getUser(){

    //if (!self::isAuthed()) {
		//	return false;
		//}

		return self::$u->get(); //self::$user;
	} // method getUser

	/**
	 * A very simple login method...
	 * We fill in the session user object
	 *
	 * @param array $vars We expect all the _GET/_POST vars with a property 'nickname' set
	 * @return boolean
	 */
	public static function loginUser ($vars)
	{
		// $nickname will becoming from world, so take extra care...
		if (!$nickname = Valid::CheckNick($vars)) {

			throw new Exception('Nickname didn\'t validate');
		}


		self::$user = array (
			'userId' => 0,
			'nickname' => $nickname
		);

		$_SESSION['user']	= array(
			'nickname'		=> $nickname,
			'gravatar'	=> ''
		);

		self::$authed = true;

		return Array('user' => self::$user);
	} // method loginUser

	/**
	 * Execute this method whenever we have a request
	 * and see that the user is logged in
	 *
	 * We fill out the local user data object and
	 * open the isAuthed() switch
	 *
	 * @return boolean
	 */
	public static function userIsLoggedIn()
	{
		self::$user = array (
			'userId' => 0,
			'nickname' => $_SESSION['user']['nickname']
		);

		self::$authed = true;

    Main::JsPass(102, self::$user);
	}

	/**
	 * Small wrapper method to get the logged in
	 * user's nickname
	 *
	 * @return string
	 */
	public static function getNickname () {
		if (self::isAuthed()) {
			return self::$user['nickname'];
		} else {
			return '';
		}
	}
} // class UserWrap

?>