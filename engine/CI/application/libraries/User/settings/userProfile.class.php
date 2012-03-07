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
 * userProfile.js [File Description]
 *
 */


class UserProfile {

    public $clsDobj = false; //data object class
    public $clsMain = false;
    public $clsDeng = false; //container for data engine class
    public $clsConfig = false;


    public $lang = false; //will hold the language object
    public $ErrorMsg = ''; //generic / default error message
    /**
     * Is used for storing responces from methods (like login) to be
     * passed to the client via AJAX
     * @var array
     */
    private $arReturn = array();

    /**
     * This array will contain whichever elemets we want to
     * UPDATE in the user table
     */
    private $Update = array();

    /**
     * This array will contain whichever elements we want to
     * UPDATE in the user_info table
     */
    private $UpdateInfo = array();

    /**
     * If user wants to change his e-mail set this to true
     * so we will sent verification e-mails and save new e-mail
     * properly
     *
     * @var boolean
     */
    private $EmailUpdate = false;



    /**
     * Handles all POST/GET submits for user
     *
     * @param array $vars
     */
    public function HandleGetPost($vars)
    {
        global $gOrigin, $clsAjax, $eye_db, $gbAjax, $main, $loader;

        $ret = false;

        //fire up the data engine class
        $this->CheckLoadDataEngine();

    	// load logged in user lang file (maybe not needed...)
    	include($loader->LoadLang('user/usersLoggedIn'));
    	global $lang;

        //Now check where we were called from
        switch ($gOrigin)
        {
            case 106: // Profile - Account
                $ret = $this->ProfileAccountMain($vars);
                break;

            case 107: // Profile - Password
                $ret = $this->ProfilePasswordMain($vars);
                break;
            case 108: // Profile - Profile
                $ret = $this->ProfileProfileMain($vars);
                break;

        } // switch Origin

        //check if we had problems in execution
        if (!$ret) {
        	// error in form submition, check if in AJAX and profile (photo) mode
            if (108 == $gOrigin && $gbAjax) {
            	$err = $clsAjax->GetResult(array(), 'php');
                $this->arReturn = array_merge($err, $this->arReturn);
                //set appropriate action value
                $this->arReturn['action'] = 100;
                echo $clsAjax->GetJsTag($this->arReturn);
                die;
            }
            return false;
        }

        if ($gbAjax)
        {

            //in case of suxess, prepare the message and send it
            //if we are in Profile Account mode then we are inside
            //an iFrame so we can emulate fake AJAX for file upload
            //so for this situation we fire up the JS script tag
            if (108 == $gOrigin) {
            	$this->arReturn = array_merge($this->GetResultArray(), $this->arReturn);
            	//set appropriate action value
                $this->arReturn['action'] = 100;
                echo $clsAjax->GetJsTag($this->arReturn);
            } else {
            	echo $clsAjax->GetResult($this->GetResultArray());
            }
            die;
        } //if in AJAX


        return true;
    } // method HandleGetPost

    /**
     * Main handler for Profile Edit - Account
     *
     * @param array $vars
     * @return boolean
     */
    private function ProfileAccountMain($vars)
    {
    	global $gbAuthed, $Err, $eye_db;

    	if (!$gbAuthed) {
            logEvent(1009, 0, 'Profile Edit but not authed');
            $Err->err(20, $this->ErrorMsg, 'Not Authenticated');
            return false;
    	}
    	if (!$this->ValidateAccount($vars)) {
    		return false;
    	}

    	//all is validated, we are ready to perform the updates
    	//init transaction
    	$eye_db->Start();
    	if (!$this->ProfileAccountUpdate()) {
    		$eye_db->RollBack();
    		return false;
    	}

    	//DB update succesfull!
    	$eye_db->Commit();


    	return true;
    } // method ProfileAccountMain

    /**
     * Validates incoming user variables for Profile Edit - Account
     *
     * @param $vars
     * @return boolean
     */
    private function ValidateAccount($vars)
    {
    	global $Err, $loader, $ClsAuth, $lang;



        //load and init validations class
        $loader->LoadClass('valid');
        $valid = new Valid();
        $valid->clsUser = $this->clsMain;

        /**
         * NICKNAME Validation
         *
         */
        $nickname = $vars['nickname'];
        //check if nick same as original, if not check / validate it...
        if (strtolower($nickname) <> strtolower($this->clsDobj->user['nickname'])) {
	        if (!$valid->CheckNick($vars)) {
	        	return false;
	        }
	        //nickname is cleared for update, log the event and assign it
	        //get the old nick from the DB
	        if (!$old_nick = $this->clsDeng->getNick($ClsAuth->GetUserId())) {
	            $Err->err(40, $this->lang['profile']['fail'], 'DB Error 1028');
	            return false;
	        }
	        //log the event
	        logEvent(1012, 0, 'Old:' . $old_nick . ' New:' . $nickname);
        } // if nickname has changed

	    //line up for update the new nickname
	    $this->Update['Nickname'] = sq($nickname);


        /**
         * EMAIL Validation
         * We check if variable is set and then if it has changed
         * we validate it
         */
        if (!isset($vars['email']))
        {
            logEvent(1009, 0, 'email var not set');
            $Err->err(20, $lang['register']['no_email'], 'email variable is not set', 302);
            return false;
        }
        //check if a new value has been typed
        if (strtolower($vars['email']) <> strtolower($this->clsDobj->user['email'])) {
	        if (!$valid->CheckEmail($vars, true)) {
	            return false;
	        }
          //email is cleared, assign it
          $this->clsDobj->user['email'] = $vars['email'];
	        //the new e-mail is stored in the data object, set the email switch to true
	        $this->EmailUpdate = true;
        } // if we have a value for e-mail

        /**
         * TIMEZONE Validation
         * Timezone should be a float between -12 and +12
         * Check if it is set (is optional)
         */
        if (isset($vars['timezone'])) {
            //assign to localvar and convert to float
            $timezone = $vars['timezone'] * 1.0;

            //check if timezone in valid values
            if(!in_array($timezone, $this->clsConfig->TimezoneValues)) {
            	logEvent(1009, 0, 'timezone not in valid values:' . $vars['timezone']);
                $Err->err(10, $lang['user']['profile']['no_timezone'], 'timezone variable is not set', 305);
                return false;
            }

            //timezone is ok, line it up for update
            $this->Update['Timezone'] = sq($timezone);
        } // if timezone is set

        /**
         * USERPRIVATE Validation
         * We only check if user has it set (it's a checkbox)
         *
         */
        if (isset($vars['userprivate'])) {
        	//user wants private bit on
        	$this->Update['UserPrivate'] = 1;
        } else {
        	$this->Update['UserPrivate'] = 0;
        }


        return true;

    } // method ValidateAccount


    /**
     * Performs the DB updates for the changes we have in the profile
     *
     * Everything we need to update is stored in the $this->Update and $this->UpdateInfo
     * properties
     *
     * @return boolean
     */
    private function ProfileAccountUpdate()
    {
    	global $eye_db, $Err, $ClsAuth, $loader;

    	//update the user table
    	if (!$eye_db->UpdateArray('user', $this->Update, 'UserId = ' . $ClsAuth->GetUserId())) {
            $Err->err(40, $this->lang['profile']['fail'], 'DB Error 1024');
            $eye_db->SQLLog('1024::On Update for UserProfile.ProfileAccountUpdate user');
            return false;
    	}

    	//update the user_info table
        if (!$eye_db->UpdateArray('user_info', $this->UpdateInfo, 'UserId = ' . $ClsAuth->GetUserId())) {
            $Err->err(40, $this->lang['profile']['fail'], 'DB Error 1025');
            $eye_db->SQLLog('1025::On Update for UserProfile.ProfileAccountUpdate user_info');
            return false;
        }

    	//now check if we had an e-mail update
    	if ($this->EmailUpdate) {
    		//yes we have to update it...
    		//first fetch stored e-mail
    		$SQL = "SELECT Email FROM user WHERE UserId = " . $ClsAuth->GetUserId();
    		if (!$eye_db->Query($SQL)) {
	            $Err->err(40, $this->lang['profile']['fail'], 'DB Error 1026');
	            $eye_db->SQLLog('1026::On Select email for UserProfile.ProfileAccountUpdate user');
	            return false;
    		}

    		if (!$eye_db->Rows()) {
    			//damn how can this happen?
                $Err->err(40, $this->lang['profile']['fail'], 'DB Error 1027');
                $eye_db->RollBack();
                logEvent(1014, 5, 'Could not get DB Email for User on Profile email change UserId:' . $ClsAuth->GetUserId());
                return false;
    		}

    		//get the result
    		$res = $eye_db->FetchArray();

    		//perform mail update and account unverification...
    		$this->CheckLoadDataEngine();
    		if (!$this->clsDeng->SaveEmail(false)) {
    			return false;
    		}
    		//log the event that user changed mail
            logEvent(1006, 0, 'Old:' . $res['Email'] . ' New:' . $this->clsDobj->user['email']);


    	} // if email is updated


    	return true;
    } // method ProfileAccountUpdate


    /**
     * Main handler for password change in profile edit
     *
     * @param $vars
     * @return boolean
     */
    private function ProfilePasswordMain($vars)
    {
    	global $Err, $ClsAuth, $eye_db;

    	if (!$this->ValidatePassword($vars)) {
    		return false;
    	}

    	//nice, perform the update now, start transaction
    	$eye_db->Start();
    	if (!$eye_db->UpdateArray('user', $this->Update, 'UserId = ' . $ClsAuth->GetUserId())) {
                $Err->err(40, $this->lang['profile']['fail'], 'DB Error 1030');
                $eye_db->SQLLog('1030::On Update  user for UserProfile.ProfilePasswordMain Password');
                return false;
    	}


        // since we save an e-mail we should
        // check if we have a native account now...
        $this->CheckLoadDataEngine();
        if (!$this->clsDeng->checkHasNativeAccount()) {
            $eye_db->RollBack();
            return false;
        }

    	// remove permanent cookie / db record
    	if (!$ClsAuth->RemoveAllAuthTokens()) {
    		$eye_db->RollBack();
    		return false;
    	}

    	$eye_db->Commit();
    	return true;
    } // method ProfilePasswordMain()

    /**
     * Validates variables for a password change
     *
     * @param $vars
     * @return boolean
     */
    private function ValidatePassword($vars)
    {
        global $Err, $loader, $ClsAuth;
        //load and init validations class
        $loader->LoadClass('valid');
        $valid = new Valid();
        $valid->clsUser = $this->clsMain;

        // we will perform 'old' password validation
        // only if user has a native account
        $checkOldPass = true;
        if (!$this->clsDobj->user['hasNativeAccount']) {
            // doesn't have a native account
            $checkOldPass = false;
        }

        // now perform check old password if we should...
        if ($checkOldPass) {
            //check that given password is valid
            // first validate the incoming variable
            if (!$ClsAuth->LoginValidate($vars, true)) {
            	return false;
            }
            // now check if the old password matches
            if (!$ClsAuth->LoginCheckPassword($ClsAuth->getUserId())) {
            	return false;
            }
        }


        /**
         * NEW PASSWORD Validation
         *
         */
        if (!$valid->CheckPassword($vars)) {
            return false;
        }
    	//nice, line the new hashed password for update
    	$this->Update['Password'] = sq($this->clsDobj->user['password']);

    	return true;
    } // method ValidatePassword

    /**
     * returns the result array with suxess messages. We only call this method
     * in case of succesful update / submit / operation
     *
     * @return array
     */
    private function GetResultArray()
    {
        global $gOrigin, $ClsAuth;
        //set success status
        $arr = array('status' => 10);

        switch($gOrigin)
        {
            case 106: // Edit Profile - Account OK
            	//check if we updated the e-mail as well
            	if ($this->EmailUpdate) {
            		$strings = array(
            		  'email' => $this->clsDobj->user['email']
            		);
            		$arr['msg'] = parse_lang($this->lang['profile']['successPlusEmail'], $strings);
            	} else {
            		$arr['msg'] = $this->lang['profile']['success'];
            	}

            	$this->CheckLoadDataEngine();
            	$this->clsDeng->LoadUserData($ClsAuth->GetUserId(), true);
            	// remove internal user data


            	$arr['user'] = $ClsAuth->GetUserData($this->clsDobj->user);

                break;

            case 107: // Edit Profile - Password OK

                $arr["msg"] = $this->lang['profile']['success_password'];
                break;
            default: //default action
            	$arr = $this->arReturn;
            	$arr['status'] = 10;
            	break;
        } //case origin

        return $arr;
    } //function GetResultArray






    /**
     * Will check if users Data Engine class is loaded and load it if not
     *
     * @return void
     */
    private function CheckLoadDataEngine()
    {

        global $loader;
        if (!$this->clsDeng)
        {
            if (!class_exists('UserDataEngine'))
            {
                $loader->LoadClass('user/UserDataEngine');
            }
            $this->clsDeng = new UserDataEngine();
            $this->clsDeng->clsDobj = $this->clsDobj;
            $this->clsDeng->clsMain = $this->clsMain;
            $this->clsDeng->lang = $this->lang;
            $this->clsDeng->ErrorMsg = $this->ErrorMsg;

        }

    } // Method CheckLoadDataEngine

    /**
     * Profile submition main method
     *
     * @param $vars
     * @return boolean
     */
    private function ProfileProfileMain($vars)
    {
        global $eye_db, $Err, $ClsAuth, $loader, $f;

        //validate incoming vars
        if (!$this->ValidateProfile($vars)) {
        	return false;
        }

        //start transaction
        $eye_db->Start();

        //update the user table
        if (!$eye_db->UpdateArray('user', $this->Update, 'UserId = ' . $ClsAuth->GetUserId())) {
            $Err->err(40, $this->lang['profile']['fail'], 'DB Error 1024');
            $eye_db->SQLLog('1040::On Update for UserProfile.ProfileProfileMain user');
            return false;
        }

        //update the user_info table
        if (!$eye_db->UpdateArray('user_info', $this->UpdateInfo, 'UserId = ' . $ClsAuth->GetUserId())) {
            $Err->err(40, $this->lang['profile']['fail'], 'DB Error 1025');
            $eye_db->SQLLog('1041::On Update for UserProfile.ProfileProfileMain user_info');
            return false;
        }

        //check if we have a photo upload
        if (isset($f['userphoto'])) {
        	if ('' <> $f['userphoto']['tmp_name']) {
	            //yes we do, load up user photo class and save
	            $loader->LoadClass('user/UserPhotos');
	            $pho = new UserPhotos();
	            $pho->lang = $this->lang;

	            if (!$pho->PhotoSave($vars)) {
	            	$eye_db->RollBack();
	                return false;
	            }
	            //init local return array and get return array from photo class
	            $this->arReturn = $pho->arReturn;

        	}
        } // if we have a photo upload

        //commit the transaction
        $eye_db->Commit();

        //now load new user data object
        $this->CheckLoadDataEngine();
        $this->clsDeng->LoadUserData($ClsAuth->GetUserId(), true);
        // remove internal user data
        $this->arReturn['user'] = $ClsAuth->GetUserData($this->clsDobj->user);
        $this->arReturn['msg'] = $this->lang['profile']['success'];
    	return true;
    } // method ProfileProfileMain


    private function ValidateProfile($vars)
    {
        global $Err, $loader, $ClsAuth;
        //load and init validations class
        $loader->LoadClass('valid');
        $valid = new Valid();
        $valid->clsUser = $this->clsMain;


        /**
         * FULLNAME Validation
         *
         */
        //check validity of fullname
        if (!$valid->CheckFullName($vars)) {
            logEvent(1020, 0, 'fullname does not validate:' . $vars['fullname']);
            return false;
        }

        //fullname is valid, line it up for update
        $this->Update['FullName'] = sq($vars['fullname']);


        /**
         * LOCATION Validation
         *
         * Location is a simple string
         */
        if (!isset($vars['location'])) {
            logEvent(1009, 0, 'location not set');
            $Err->err(20, $lang['user']['profile']['no_location'], 'location variable is not set', 307);
            return false;
        }

        $location = $valid->RipString($vars['location'], 80);
        if (strlen($location)) {
            if (!$valid->CheckLocation($location)) {
                logEvent(1020, 0, 'location does not validate:' . $vars['location']);
                $Err->err(10, $lang['user']['profile']['not_valid_location'], '', 307);
                return false;
            }

            //location is valid
            $this->UpdateInfo['Location'] = sq($location);
        } else {
            $this->UpdateInfo['Location'] = sq('');
        }

        /**
         * HOMEPAGE Validation
         *
         * we test if is url
         */
        if (!isset($vars['homepage'])) {
            logEvent(1009, 0, 'homepage not set');
            $Err->err(20, $lang['user']['profile']['no_homepage'], 'homepage variable is not set', 308);
            return false;
        }
        $homepage = $valid->RipString($vars['homepage'], 250);

        if (strlen($homepage)) {
            //check if we have the http:// prefix
            if ('http' <> strtolower(substr($homepage, 0, 4))) {
                $homepage = 'http://' . $homepage;
            }

            if (!$valid->CheckUrl($homepage)) {
                logEvent(1020, 0, 'homepage does not validate:' . $vars['homepage']);
                $Err->err(10, $this->lang['profile']['not_valid_homepage'], '', 308);
                return false;
            }
            //homepage is valid
            $this->UpdateInfo['Homepage'] = sq($homepage);
        } else {
            $this->UpdateInfo['Homepage'] = sq('');
        }

        /**
         * BIO Validation
         *
         * We just assign it
         */
        if (!isset($vars['bio'])) {
            logEvent(1009, 0, 'bio not set');
            $Err->err(20, $lang['user']['profile']['no_bio'], 'bio variable is not set', 309);
            return false;
        }
        $this->UpdateInfo['UserBio'] = sq($valid->RipString($vars['bio'], 512));

        return true;
    } // method ValidateProfile
} // class UserProfile

?>