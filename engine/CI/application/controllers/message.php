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
 * created on Jun 27, 2011
 * message.php User private messages
 *
 */

/**
 * User private messages
 *
 * @author Thanasis Polychronakis <thanasisp@gmail.com>
 */
class message extends CI_Controller{

  function __construct() {
    parent::__construct();

    // Authed only area!
    if (!$this->user->isAuthed())
      raise_error ('You need to be logged in to perform this action');


    $this->load->model('msg');
  }

  /**
   * Perform a PM send
   *
   * We expect 'to_userId' (int) and 'message'
   *
   * @return void
   */
  public function send()
  {


    // fill in our data array
    $data = array(
        'from_userId' => $this->user->getID(),
        'to_userId' => (int) $this->input->post('to_userId'),
        'message' => (string) Valid::RipString($this->input->post('message'), 140)
    );

    $this->msg->send($data);

    die_json(array('status' => 10));

  }

  /**
   * Get the current user's private messages
   *
   * We pull for the past 6 months or 100 messages
   *
   * @return void
   */
  public function get()
  {

    die_json($this->msg->get());


  }

  /**
   * Perform a read on a message
   *
   *
   * @param int $msgId
   * @return void
   */
  public function read($msgId)
  {
    $msgId = (int) $msgId;
    die_json($this->msg->read($msgId));
  }

  /**
   * Perform a read on all the messages
   * from a specific user
   *
   *
   * @param int $uId
   * @return void
   */
  public function readUser($uId)
  {
    $uId = (int) $uId;
    die_json($this->msg->readUser($uId));
  }

  /**
   * Delete a message
   *
   * @param int $msgId
   * @return void
   */
  public function delete($msgId)
  {
    $msgId = (int) $msgId;
    die_json($this->msg->delete($msgId));
  }
}

?>
