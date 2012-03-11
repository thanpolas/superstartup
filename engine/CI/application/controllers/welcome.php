<?php

if (!defined('BASEPATH'))
  exit('No direct script access allowed');

class Welcome extends CI_Controller {

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
    $this->load->helper('url');


    // $this->load->scaffolding('users');
  }

  public function index() {
    $this->load->model('core/ab_test');
    $ab = $this->ab_test->getVersion('frontpage_1');
    $this->main->JsPass(58, array('isFront' => true));
    $this->load->view('frontpage', array('ab' => $ab));
	}

}

/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */