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
 * created on Jun 7, 2011
 * our404.js 404 handler, main router for booths
 *
 */


if (!defined('BASEPATH'))
  exit('No direct script access allowed');

class Our404 extends CI_Controller {

  /**
   * Index Page for this controller.
   *
   * Maps to the following URL
   * 		http://example.com/index.php/welcome
   * 	- or -
   * 		http://example.com/index.php/welcome/index
   * 	- or -
   * Since this controller is set as the default controller in
   * config/routes.php, it's displayed at http://example.com/
   *
   * So any other public methods not prefixed with an underscore will
   * map to /index.php/welcome/<method_name>
   * @see http://codeigniter.com/user_guide/general/urls.html
   *
   *
   */
  function __construct() {
    parent::__construct();
    //Load the session library - we are using autoload for this.
    //$this->load->library('session');
    //Load the user helper - If the helper is autoloaded remove this from here
    //$this->load->helper('user');
    $this->load->helper('url');
    //Load the user model
    //$this->load->model('user');

    // $this->load->scaffolding('users');
  }

  /**
   * This is the main 404 handler / router.
   *
   * Typicaly user comes here with a booth URL:
   * http://boothchat.com/a_booth_to_join
   *
   * We validate for a boothname and take proper actions
   *
   * We also check for Frame URLs like:
   * http://boothchat.com/a_booth_to_join/FRAMEID
   *
   * otherwise we display a standar 404 error...
   *
   *
   * @return void
   */
  public function index() {

    global $main;

    $totalSegs = $this->uri->total_segments();

    // check for filenames to ignore the 404
    $ignore_files = array ('deps.js');
    if (in_array($this->uri->segment($totalSegs), $ignore_files))
      // tough cookies
      die();


    //echo $this->uri->segment($this->uri->total_segments());
    //die($this->uri->total_segments());
    //
    //
    // no matter what the purpose our very first segment
    // from our URI should be a valid booth name
    $boothName = Valid::CheckBoothName($this->uri->segment(1));

    $uri_str = uri_string();
    // check if invalid name and die with a 404
    if (false === $boothName)
      show_404($uri_str);


    $baseId=2364; //which?
    $webchatId=intval($this->uri->segment(2));
    if ($totalSegs ==2 && $webchatId > $baseId)
      show_404 ();



    /**
     * Get how many segments our URI consists of
     * depending on the number we have:
     * 1: A single booth to join (/booth_10540)
     * 2: A Single Frame View to view (/booth_10540/342) ONLY IN LEGACY MODE
     * 3: A booth to join and start viewing from x frame and
     *    up or down (/booth_10540/342/newer or /older)
     *
     */
    switch($totalSegs) {
      case 1:


        // check if 'wasteland' (private admin channel)
        if ('wasteland' == strtolower($boothName)) {

          $this->load->model('admin');
          if (!$this->admin->isAdmin())
            show_404();

        }


        //redirect(base_url() . '/#/' . $boothName);

        $boothData = Booth::joinBoothByName($boothName);

        /**
         *
         * We now do this inline in the header and frontpage files
         *
        // check if user came from an advertisement campaign
        if ($this->session->userdata('campaignVisitor')) {
          // he is a campaign visitor
          $cdata = $this->session->userdata('campaignData');
          // check if we need to notify JS
          if (!$cdata['jsdone']) {
            $cdata['jsdone'] = true;
            $this->session->unset_userdata('campaignData');
            $this->session->set_userdata('campaignData', $cdata);
            $this->main->JsPass(55, $cdata);
          }
        }
         *
         */

        $this->main->JsPass(50, $boothData);
        $this->main->JsPass(57, array('isBooth' => true));
        $this->load->helper('date');
        $this->load->view('main_boothchat', $boothData);
        return;
      break;
      case 2: //we must be in legacy mode right now
        // get Frame and Booth Data objects
        $fbData = Booth::getSingleFrameData($uri_str);
        if (!$fbData) {
          // not a valid Frame URL
          show_404($uri_str);
        }
        // inform JS engine that we are in Single Frame View
        $this->main->JsPass(51, array('isSFV' => true));
        $this->main->JsPass(52, array('sfvData' => $fbData));
        // we have boothData and frameData
        //die(debug_r($fbData));
        $this->load->view('single_frame', $fbData);
        return;

      break;
      case 3:
        // we request a history page
        $this->load->model('boothM');
        $chatData = $this->boothM->showHistory($boothName, $this->uri->segment(2), $this->uri->segment(3));
        /*
         * We are multipurpose, for AJAX calls we simply return
         * the data objects (if user is authed) for page calls
         * we check if user is a robot and serve or ...
         * ... redirect user to boothname for now until we build
         * a flow to inject the instructions to JS
         *
         */
        // get only the chats object
        $chats = $chatData['chats'];

        // if in AJAX mode then we are ok, just spit it out
        if (IN_AJAX) {
          die_json($chats);
        }

      break;

      case 4:
         // get Frame and Booth Data objects
        $fbData = Booth::getSingleFrameData($uri_str);
        if (!$fbData) {
          // not a valid Frame URL
          show_404($uri_str);

        }
        // inform JS engine that we are in Single Frame View
        $this->main->JsPass(51, array('isSFV' => true));
        $this->main->JsPass(52, array('sfvData' => $fbData));
        // we have boothData and frameData
        //die(debug_r($fbData));
        $this->load->view('single_frame', $fbData);
        return;

      break;
    }


  // method index
  }
// class Our404
}


?>