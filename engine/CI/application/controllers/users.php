<?php

/* * ****
 * Based on Fotis Alexandrou source modified and debugged by Thrasos Nerantzis
 * and Thanasis Polychronakis
 *
 *
 * **** */

class Users extends CI_Controller {

  /**
   * Constructor - Access Codeigniter's controller object
   *
   */
  function __construct() {
    parent::__construct();


    $this->load->helper('url');

    // $this->load->scaffolding('users');
  }

  /**
   * Placeholder for default functions to be executed
   * check  to see if user is logged in , if yes continue to chat interface
   */
  public function index() {
    // do nothing
    return;


//	if (!is_logged()) {
//	    redirect('users/login');
//	}
//	//Get the user id
    //Load a home view
    $user = get_user();

//	$this->load->view('users/home', array('user'=>$user));


    $this->load->model('chat_model');

    $data['result'] = $this->chat_model->getData();


    $data['page_title'] = "CI Chat World !";
    $data['someone'] = $this->chat_model->getSessionID();
    $data['user'] = $user;

    //$this->load->view('users/home', array('user'=>$user));
  }

  /**
   * Perm Cook lander.
   *
   * This is called after JS verifies that client has cookies
   * enabled
   *
   * We create and store a new perm cookie on the visitor
   *
   * We send back a new metadataObject
   *
   * @return void
   */
  public function pc() {

    $this->load->model('core/userperm');
    $this->load->config('core_config');

    // check if perm cookie exists
    $cook = $this->input->cookie($this->config->item('perm_cookiename'));
    if (is_string($cook)) {
      die_json(array('status' => 10));
    }

    // create and get the permcook data object
    $pc = $this->userperm->createNew();



    // get session data
    $sd = $this->session->userdata('sessionData');

    // update session data
    $sd['permData'] = $pc;



    $this->session->unset_userdata('sessionData');
    $this->session->set_userdata('sessionData', $sd);
    $this->session->set_userdata('justMarried', true);
    // update PERMID global
    $this->PERMID = $pc['permId'];

    // now update the metadata object and send it to the client
    $this->load->model('core/metadata');
    $md = $this->metadata->updateData();

    // all done
    die_json(array('status' => 10, 'metadataObject' => $md));

  }

  /**
   * Displays the login screen
   *
   * @deprecated for now...
   */
  public function login() {
    return;
    $this->load->library('User/fb');
    $this->load->library('User/tweet');

    //print_r($this->session);

    //Look for errors from previous steps
    $error = $this->session->flashdata('register_error');
    $this->load->view('users/login', array('fb' => $this->fb, 'twitter' => $this->tweet, 'error' => $error));
  }



  /**
   * Logs user in with facebook
   *
   *
   */
  public function facebook()
  {

    $this->load->library('core/User/fb');


    //$sessData = $this->session->userdata('sessionData');


    //die(debug_r($this->fb->loadUserObject()));



    if (!$this->fb->is_connected()) {
      raise_error('Failed to login to FB. Please retry');
      //redirect($this->fb->login_url(current_url()));
      //echo 'not connected';
    }

    // we are connected, get FB user data object
    $fb_user = $this->fb->loadUserObject();

    $user = $this->user->get($fb_user['id'], true, SOURCE_FB);
    // set the newuser switch to off
    $newuser = false;
    // check if we didn't find user (new user)
    if (!$user) {
      // User is not registered with our website...
      // auto register him/her...
      if (!$this->fb->newUser()) {

        raise_error('Something failed, please retry','Failed to assign new user from FB');
      }

      // create the user in our DB
      $user = array();
      $user['userId'] = $this->user->add(SOURCE_FB);

      $newuser = true;

      // continue normaly...
    }

    //Login & Redirect home
    $this->user->login($user['userId'], SOURCE_FB, $newuser);

    // login success, send the user his/her data object
    $return = array('user' => $this->user->get_public());
    if ($newuser)
      $return['newuser'] = true;


    
    die_json($return);
    return;
  }

  /**
   * Logs user in with twitter
   *
   * If not already authed, we send the user to twitter
   * to authenticate / authorize ... then we get back here
   *
   * If everything plays out nicely we do a last redirect
   * back to slash (/) with flashdata 'twitter' written
   * so we can issue a tag lander action (to our JS engine)
   * for twitter
   *
   * @return void
   */
  public function twitter() {
    $this->load->library('User/tweet');


    //$this->tweet->logout();
    //die('goog');
    if (!$this->tweet->logged_in()) {
      // we have the current url with the hashtag (#) passed
      // in the GET var 'url' ... grab it
      $url = $this->input->get('url');

      // remove leading slash from string
      //$url = substr($url, 1);

      // save it to session
      $this->session->set_userdata('tweeterOrigUrl', $url);
      // current_url() prepends a question mark (?) on the URI
      // forcing us to work manualy
      $this->tweet->set_callback(base_url() .  uri_string());

      $this->tweet->login();
      return;
    }


    // get the tweet user data object
    $tw_user = $this->tweet->loadUserObject();

    if (empty($tw_user)) {
      #TODO: Localize error messages etc
      //$error = 'TWITTER LOGIN FAILED - USER IS EMPTY FILE: ' . __FILE__ . ' LINE: ' . __LINE__;
      //$this->session->set_flashdata('register_error', $error);
      raise_error('Authentication failed, please retry', 'Twitter auth fail');
    }

    // try to load user from our DB
    $user = $this->user->get($tw_user->id, true, SOURCE_TWIT);


    $newuser = false;
    // check if we didn't find user (new user)
    if (!$user) {
      // User is not registered with our website...
      // auto register him/her...
      if (!$this->tweet->newUser()) {

        raise_error('Something failed, please retry','Failed to assign new user from TW');
      }

      // create the user in our DB
      $user = array();
      $user['userId'] = $this->user->add(SOURCE_TWIT);

      // we'll get redirected to / ... inform ourselves that
      // we are a new user...
      $this->session->set_userdata('tweeterNewUser', true);
      $newuser = true;

    }

    //Login & Redirect home
    $this->user->login($user['userId'], SOURCE_TWIT, $newuser);
    //$this->load->view('users/redirect_home');

    // login success, browser is not in AJAX mode
    // so we need to redirect it to our session saved url
    // (which actually is a URI)
    $uri = $this->session->userdata('tweeterOrigUrl');
    // remove leading slash from string
    if ('/' == substr($uri, 0, 1))
      $uri = substr($uri, 1);
    $this->session->unset_userdata('tweeterOrigUrl');
    redirect(base_url() . $uri);
    return;

    /**
     *
     *
     * Depricated code, remove after Aug 2011
     *
     *
      $this->user->set_twitter_id($tw_user->id_str);
      $user = $this->user->get_by_twitter();
      if (!empty($user) && !empty($user->id) && is_numeric($user->id)) {
        //TODO: Make things a bit more secure here
        $this->_login($user->id, 'twitter');
        $this->load->view('users/redirect_home');
      }
      //redirect('');
    }
    //Go to the registration page, we need the concent of the user before proceeding.
    $this->load->view('users/redirect', array('method' => 'twitter'));

    */

  // method twitter()
  }



  /**
   * Logs out current user
   *
   * @return void
   */
  public function logout()
  {

    $this->user->logout();
    die_json(array('status' => 10));
  }

  /**
   * Facebook has an issue with cookies unsetting, so...
   */
  private function _fb_logout() {

    $base_url = $this->config->item('base_url');

    if (array_key_exists('HTTP_REFERER', $_SERVER)) {
      $refer = $_SERVER['HTTP_REFERER'];
    } else {
      $refer = null;
    }

    $this->load->library('core/User/fb');
    $param = (int) $this->input->get('ret');
    //Local call
    if ($param != 1) {
      //Store referer into a session variable
      $url = $this->fb->logout_url(current_url() . '?ret=1');
      redirect($url);
    } else {
      $this->load->config('facebook');

      $app_id = $this->config->item('facebook_app_id');
      $api_key = $this->config->item('facebook_api_key');

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

      if ($goto == null || $goto == '') {
        $goto = site_url('/');
      }

      $session = $this->fb->client->getSession();

      redirect($goto);
    }
  }

  /**
   * Logout from twitter
   */
  private function _tw_logout() {
    $this->load->library('core/User/tweet');
    $this->tweet->set_callback(current_url() . '?ret=1');
    $this->tweet->logout();
  }

  /**
   * Return latest notifications for current logged in user
   *
   * @return void
   */
  public function notify()
  {
    if (!$this->user->isAuthed())
      raise_error ('You need to be logged in to perform this action');


    $this->load->model('core/notify');

    die_json($this->notify->getStatic());
  }

}