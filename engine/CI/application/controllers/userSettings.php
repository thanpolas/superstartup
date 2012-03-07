<?php

/**
 *  @copyright  (C) 2000-2011 Thanasis Polychronakis - All Rights Reserved
 *  @author Thanasis Polychronakis <thanasisp@gmail.com>
 *
 * ********
 * This program is bound to the license agreement that can be found in the root
 * folder of this project. This Agreement does not give you any intellectual property
 * rights in the program. It does not Grand you permission to copy, distribute, redistribute
 * or make any possible use of this program, this is a private work intended for private use.
 *
 * You should have received a copy of the License Agreement along with this program
 * If not, write to: Plastikopiitiki S.A., Attn: Thanasis Polychronakis, P.O. Box 60374,
 * Zip 57001, Thermi, Greece
 *
 *
 * ********
 * created on Aug 16, 2011
 * userSettings.php controler for submition of user profiles / account etc
 *
 */
class UserSettings extends CI_Controller {

  /**
   * Constructor - Access Codeigniter's controller object
   *
   */
  function __construct() {
    parent::__construct();
    // Authed only area!
    if (!$this->user->isAuthed())
      raise_error('You need to be logged in to perform this action');

    $this->load->model('usersets');
  }
  //public function index() {
  //  debug_r($this);
  //}
  /**
   * Main handler for Profile Edit - Account
   *
   * @return void
   */
  public function account() {
    global $gbAuthed, $Err, $eye_db;

    // validate incoming data, if some error we die
    // in that method...
    $data = $this->_validateAccount();

    // check if we need to update anything at all..
    if ($data['nicknameUpdate'] || $data['emailUpdate'])
      //all is validated, we are ready to perform the updates
      if (!$this->usersets->account($data)) {
        raise_error('Some error occured, please retry');
      }
    die_json(array(
        'status' => 10,
        'user' => $this->user->get_public()
    ));
  }

  /**
   * Will validate incoming variables for account
   * submition.
   *
   * We return a complete and proper array with all
   * the variables sanitized
   *
   * @return array
   */
  private function _validateAccount() {
    $data = array(
        'nickname' => '',
        'nicknameUpdate' => false,
        'email' => '',
        'emailUpdate' => false
    );

    // get the user data
    $ud = $this->user->get();

    /**
     * NICKNAME Validation
     *
     */
    if (false === $this->input->post('nickname'))
      raise_error('Please enter a proper nickname', 'nickname var not set');
    $nickname = $this->input->post('nickname');
    //check if nick same as original, if not check / validate it...
    if (strtolower($nickname) <> strtolower($this->user->getNickname())) {
      // validate if nick is ok and it doesn't exist.
      // if errors are found die with proper error message
      $vars = array('nickname' => $nickname);
      $nickname = Valid::CheckNick($vars, true, true);
      $data['nicknameUpdate'] = true;
      //nickname is cleared for update, log the event and assign it
      //log the event, not yet...
      //logEvent(1012, 0, 'Old:' . $old_nick . ' New:' . $nickname);
    } // if nickname has changed
    //line up for update the new nickname
    $data['nickname'] = $nickname;


    /**
     * EMAIL Validation
     * We check if variable is set and then if it has changed
     * we validate it
     */
    if (false === $this->input->post('email'))
      raise_error('Please enter a proper e-mail', 'email var not set');

    //check if a new value has been typed
    $email = $this->input->post('email');
    if (strtolower($email) <> strtolower($ud['email'])) {
      // check mail valitidy and die if wrong
      Valid::CheckEmail($email, true, true);
      //email is cleared, assign it
      $data['email'] = $email;
      //the new e-mail is stored in the data object, set the email switch to true
      $data['emailUpdate'] = true;
    } // if we have a value for e-mail

    return $data;
  }

  /**
   * Main handler for Profile Edit - Profile
   *
   * @return void
   */
  public function profile() {


    // assign expected env variables
    $vars = array (
        'fullname' => $this->input->post('fullname'),
        'location' => $this->input->post('location'),
        'web' => $this->input->post('web'),
        'bio' => $this->input->post('bio')
    );

    // validate incoming data, if some error we die
    // in that method...
    $data = $this->_validateProfile($vars);
    //all is validated, we are ready to perform the updates
    if (!$this->usersets->profile($data)) {
      raise_error('Some error occured, please retry');
    }
    die_json(array(
        'status' => 10,
        'user' => $this->user->get_public()
    ));
  }

  /**
   * Validate incoming variables for profile save
   *
   * If we find an error we die
   *
   * @param array $vars Expected vars in one array
   * @return array
   */
  private function _validateProfile($vars) {
    global $Err, $loader, $ClsAuth;

    // prepare data array that will contain sanitized values
    $data = array();

    /**
     * FULLNAME Validation
     *
     */
    //check validity of fullname
    Valid::CheckFullName($vars, true);

    //fullname is valid, line it up for update
    $data['fullname'] = $vars['fullname'];


    /**
     * LOCATION Validation
     *
     * Location is a simple string
     */
    if (false === $vars['location']) {
      raise_error('Location is not valid', 'location information not set', true);
      return false;
    }
    $data['location'] = Valid::RipString($vars['location'], 80);


    /**
     * HOMEPAGE Validation
     *
     * we test if is url
     */
    if (false === $vars['web']) {
      raise_error('Web address is not valid', 'web variable is not set', true);
      return false;
    }
    $web = Valid::RipString($vars['web'], 250);

    if (strlen($web)) {
      //check if we have the http:// prefix
      if ('http' <> strtolower(substr($web, 0, 4))) {
        $web = 'http://' . $web;
      }

      if (!Valid::CheckUrl($web)) {
        raise_error('Your web address is not a valid URL');
        return false;
      }
    }
    $data['web'] = $web;

    /**
     * BIO Validation
     *
     * We just assign it
     */
    if (false === $vars['bio']) {
      logEvent(1009, 0, 'bio not set');
      raise_error('Your bio is not valid', 'bio variable is not set', true);
      return false;
    }
    $data['bio'] = Valid::RipString($vars['bio'], 140);

    return $data;
  }  // method _validateProfile


  /**
   * User e-mail alerts settings submit
   *
   * We expect these variables with values of 0 or 1:
   * mentions, frameComments, messages
   *
   * @return void
   */
  public function alerts()
  {

    // assign expected env variables and validate at same time
    // fallback to always open alerts
    $vars = array (
        'mentions' => (0 == (int) $this->input->post('mentions') ? false : true),
        'frameComments' => (0 == (int) $this->input->post('frameComments') ? false : true),
        'messages' => (0 == (int) $this->input->post('messages') ? false : true)
    );

    //all is validated, we are ready to perform the updates
    $this->usersets->alerts($vars);
    die_json(array(
        'status' => 10,
        'user' => $this->user->get_public()
    ));

  }

} // class UserSettings
?>