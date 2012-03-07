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
 * created on Sep 8, 2011
 * userp.php Controller for user public requests
 *
 */


/**
 * Description of userp
 *
 * @author Thanasis Polychronakis <thanasisp@gmail.com>
 */
class userp extends CI_Controller {

  /**
   * Constructor - Access Codeigniter's controller object
   *
   */
  function __construct() {
    parent::__construct();
  }

  /**
   * Apublic method to get public user data objects
   * based on nickname (?) for now?...
   *
   *
   * @param string $nickname
   * @return void
   */
  public function get()
  {
    $nickname = $this->input->post('nickname');
    if (false === $nickname)
      raise_error('Please enter a proper nickname', 'nickname var not set');

    // validate if nick is ok and it doesn't exist.
    $vars = array('nickname' => $nickname);
    $nickname = Valid::CheckNick($vars, false, true);

    // get user data object
    $ud = $this->user->get($nickname);

    if (false === $ud)
      die_json (array('status' => 20));

    list(,$ud) = each($this->user->get_public($ud, true));
    $return = array(
      'status' => 10,
      'user' => $ud
    );

    die_json($return);

  }
}

?>