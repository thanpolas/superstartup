<?php

/**
 *  @package geowarp project                                                  <br>
 *  @copyright  (C) 2000-2010 Thanasis Polichronakis - All Rights Reserved                   <br>
 *  @author Thanasis Polichronakis <thanasisp@gmail.com>                                     <br>
 *                                                                                           <br>
 * ********                                                                                   <br>
 *  File:: /engine/classes/valid.class.php                                                                           <br>
 *  Generic validations class                                                                <br>
 *                                                                                           <br>
 * ********                                                                                   <br>
 * This program is bound to the license agreement that can be found in the root              <br>
 * folder of this project. This Agreement does not give you any intellectual property        <br>
 * rights in the program. It does not Grand you permission to copy, distribute, redistribute <br>
 * or make any possible use of this program, this is a private work intended for private use.<br>
 *                                                                                           <br>
 * You should have received a copy of the License Agreement along with this program          <br>
 * If not, write to: Plastikopiitiki S.A., Attn: Thanasis Polichronakis, P.O. Box 60374,     <br>
 * Zip 57001, Thermi, Greece                                                                 <br>
 *                                                                                           <br>
 * $Id: valid.class.php 722 2011-01-07 17:08:25Z babbos $                                                                                  <br>
 *                                                                                           <br>
 * ********                                                                                   <br>
 * @license [PendingLicenceLink]
 * @version $Id: valid.class.php 722 2011-01-07 17:08:25Z babbos $
 * @filesource
 * @createdate ~2000
 *
 */
class Valid {

  var $string;
  var $error;
  /**
   * ClassUserMain is set when needed for CheckEmail, CheckPassword etc
   *
   * @var array
   */
  public $clsUser = false;
  /**
   * Configuration Class container
   *
   * @var class
   */
  public $conf = false;
  /**
   * This array is set with length limits for user strings
   * like nickname, email, password etc... how long can they
   * be
   *
   * Basic string length limits for validations
   * Values are inclusive (use >= or <=)
   *
   * @var array
   */
  public static $strLimits = array(
      'nick_lo' => 1,
      'nick_hi' => 16,
      'email_lo' => 6,
      'email_hi' => 250,
      'pass_lo' => 6,
      'pass_hi' => 30,
      'fname_lo' => 2,
      'fname_hi' => 30,
      'bio' => 160,
      'spot_name' => 32
  );



  /**
   * The constructor
   *
   * @param string $string Single string validation mode
   *
   */
  function Valid($string ='') {
    global $loader;
    return;
    $this->string = $string;
    $this->error = '';

    if (!class_exists('ValidConfig')) {
      $loader->LoadConfig('valid');
    }
    $this->conf = new ValidConfig();
    $this->strLimits = $this->conf->LengthLimits;
  }

  /**
   * Will make a string proper based on string length provided.
   * Will also trim the string of spaces.
   *
   * @param string $str The string
   * @param int $len The desired Max length of the string
   * @return string the proper string
   */
  public static function RipString($str, $len) {
    //first check if what is passed is indeed a string
    if (!is_string($str))
      return '';

    $str = trim($str);

    if ($len < strlen($str)) {
      $str = mb_substr($str, 0, $len);
    }
    return $str;
  }

//function RipString

  /**
   * Rips a string allowing only numeric values and the + symbol.
   * Is best for validating phone numbers
   * @param string $str
   * @return string The riped string
   */
  public function RipPhone($str) {
    //first check that we have at least a string type (and not an array, object, whatever)
    if (!is_string($str))
      return '';

    $str = @eregi_replace("[^0-9,+]", null, $str);

    $first_char = substr($str, 0, 1);

    $second_to_end = substr($str, 1, strlen($str));

    //rip the second_to_end variable from anything but numeric chars
    $second_to_end = @eregi_replace("[^0-9]", null, $second_to_end);

    $str = $first_char . $second_to_end;
    return $str;
  }

//function RipPhone

  /**
   * Checks the validity of an email string
   *
   * @param string $str The email we want to validate
   * @param boolean $check_dns if we want to perform a MX DNS check
   * @return boolean True / False based on validity of email
   */
  public static function CheckEmailValidity($str, $check_dns = FALSE) {

    //first check that we have at least a string type (and not an array, object, whatever)
    if (!is_string($str))
      return false;

    //check if string within character length limits
    $len = strlen($str);
    if (self::$strLimits['email_lo'] > $len || self::$strLimits['email_hi'] < $len) {
      return false;
    }

    //check if we have a user@domain type of string
    $parts = explode("@", $str);
    if (!isset($parts[1])) {
      return FALSE;
    } //if we had two parts in email
    //check if the second part (domain) consists of two parts, e.g:domain.com
    $parts2 = explode('.', $parts[1]);
    if (!isset($parts2[1])) {
      return FALSE;
    } //if we had two parts in domain
    //TODO uncomment when for use in UNIX envs... or PHP 5.3 for Windows
    /*
      if ($check_dns)
      {
      if(!checkdnsrr($parts[1],"MX")) //if The domain givven in the email is not valid
      {
      $err_msg = $_register_not_valid_domain;
      }
      } //if $check_dns
     */

    return TRUE;
  }

//function CheckEmailValidity

  /**
   * Returns a proper website url string of the form: http://www.site.com <br>
   * If we have validation errors it returns False
   * @param string $str The givven website string
   * @return mixed Proper URL String if validation ok False otherwise
   */
  public function GetWebsite($str) {
    //first check that we have at least a string type (and not an array, object, whatever)
    if (!is_string($str))
      return '';

    $str = strtolower($str);

    //check if string is empty, return empty string
    if (0 == strcmp('', $str)) {
      return '';
    }

    //Regular Expression bellow from: http://www.phpcentral.com/208-url-validation-php.html
    // Check if we have proper http/https prefix
    $urlregex = "^(https?)\:\/\/";
    if (!eregi($urlregex, $str)) {
      //we dont, add it
      $str = 'http://' . $str;
    }

    // HOSTNAME OR IP
    $urlregex = "[a-z0-9+\$_-]+(\.[a-z0-9+\$_-]+)+";  // http://x.x = minimum
    // PATH  (optional)
    $urlregex .= "(\/([a-z0-9+\$_-]\.?)+)*\/?";

    // check
    if (!eregi($urlregex, $str)) {
      return FALSE; //not valid
    }

    return $str;
  }

//function GetWebsite

  /**
   * Validates an Id
   *
   * @param mixed $id The id we want to validate
   * @return int
   */
  function CheckId($id) {
    return (int) $id;
  }

// method CheckId

  /**
   * Validates a string ID
   *
   * $type can be: spot, user
   *
   * @param mixed $id
   * @param string $type [optional] The type of Url Id - spot is default
   * @return string
   */
  function CheckUrlId($id, $type = 'spot') {

    // if the id is numeric then it's not valid...
    if (is_numeric($id)) {
      return 'x';
    }
    return (string) $this->RipString($id, 6);
  }

// method CheckUrlId

  function CheckString() {
    if (strlen($this->string) > 80)
      return false;
    settype($this->string, "string");

    return $this->string;
  }

  function SearchString() {
    $this->string = str_replace("*", "%", $this->string);

    //also add wildcards in beginning and end of search string
    $this->string = '%' . $this->string . '%';

    return $this->string;
  }

//function searchstring

  function CheckText($maxchars, $type='') {
    //this function will only check for maxchars for now (31-aug-2001)

    $len = strlen($this->string);
    if ($len > $maxchars) {
      $this->error = "maxchars $len";
      return FALSE;
    }
    //$this->string = htmlspecialchars($this->string);
    //$this->string = nl2br($this->string);
    if ($type = 'subject') {
      //replace all newlines to spaces
      $this->string = str_replace("\n", ' ', $this->string);
    }
    return $this->string;
  }

//function ConvertHtml

  function Set($varname, $value) {
    $this->$varname = $value;
  }

  /**
   * Booth Name Validation
   *
   * We will check if the given booth name is proper and valid
   *
   * @param string $boothName the nickname
   * @param boolean $opt_die [optional] set to TRUE if we want to die if booth doesn't validate
   * @return string | boolean the proper nickname or false if error
   */
  public static function CheckBoothName($boothName, $opt_die = false) {


    //assign and rip/trim booth name string
    $boothName = self::RipString($boothName, 160);

    if ('' == $boothName) {
      //$Err->err(20, 'No Booth name has been entered', 'BoothName empty');
      return false;
    }


    //check if string within character length limits
    $len = strlen($boothName);
    if (60 < $len) {
      if ($opt_die)
        raise_error('Booth name is very big (max length:' . 60 . ')', '');
      return false;
    }


    $reg = '/^[a-z\d-_]{1,60}$/i';
    $res = preg_match($reg, $boothName);

    if (!$res) {
      if ($opt_die)
        raise_error('Please enter a valid Booth Name', 'boothName:' . $boothName . ' does not validate');
      return false;
    }



    // check if name in invalid names
    if (in_array(strtolower($boothName), Booth::$invalid_booth_names)) {
      if ($opt_die)
        raise_error('Please choose a different booth name');
      return false;
    }

    return $boothName;
  }

// static method CheckBoothName

  /**
   * NICKNAME Validation
   * Checks against:
   * - If var is set
   * - If nickname within acceptable lengths
   * - If chars are legal nickname characters (we store the illegal char in clsUser->clsDobj->ErrorObject['genObject']
   * - If nickname already exists
   *
   * @param string $string the nickname
   * @param boolean $checkAvail [optional] if false we do not perform email availability check
   * @param boolean $opt_die set to TRUE if we want to die on error
   * @return string | boolean the proper nickname or false if error
   */
  public static function CheckNick($vars, $checkAvail = true, $opt_die = false) {


    //check if nick var is defined
    if (!isset($vars['nickname'])) {
      if ($opt_die)
        raise_error('No nickname given', 'nickname variable is not set', 300);
      return false;
    }

    //assign and rip/trim nickname string
    $nickname = self::RipString($vars['nickname'], 40);

    //check if string within character length limits
    $len = strlen($nickname);
    if (self::$strLimits['nick_lo'] > $len) {
      if ($opt_die)
        raise_error('Nickname is very short (min length:' . self::$strLimits['nick_lo'] . ')', '', 300);
      return false;
    }
    if (self::$strLimits['nick_hi'] < $len) {
      if ($opt_die)
        raise_error('Nickname is very big (max length:' . self::$strLimits['nick_hi'] . ')', '', 300);
      return false;
    }

    $reg = '/^[a-z\d-_]{' . self::$strLimits['nick_lo'] . ',' . self::$strLimits['nick_hi'] . '}$/i';
    $res = preg_match($reg, $nickname);

    if (!$res) {
      if ($opt_die)
        raise_error('Please enter a valid nickname');
       return false;
    }


    //now check if this nickname exists
    if ($checkAvail) {
      $CI = & get_instance();
      if ($CI->user->nickExists($nickname)) {
        if ($opt_die)
          raise_error('Nickname is already in use');
        return false;
      }

    }
    //nickname is cleared for insert, assign it
    //if ($this->clsUser)
    //    $this->clsUser->clsDobj->user['nickname'] = $nickname;

    return $nickname;
  }

//function CheckNick

  /**
   * Full Name must contain letters, dashes and spaces only and must start with upper case letter.
   *
   * code snippet from: http://www.phpjabbers.com/phpexample.php?eid=27
   *
   * @param string $fullname
   * @param boolean $opt_die [optional] set to true if we want to die
   * @return boolean
   */
  public static function CheckFullName($vars, $opt_die = false) {

    // used to be isset, now with CI it should be false
    if (false === $vars['fullname']) {
      if ($opt_die)
        raise_error('No fullname was typed', 'fullname variable is not set');
      return false;
    }
    $fullname = $vars['fullname'];

    //check for sizes now
    //if (self::$strLimits['fname_lo'] > strlen($fullname)) {
    //  if ($opt_die)
    //    raise_error('Fullname is less than ' . self::$strLimits['fname_lo'] . ' characters');
    //  return false;
   // }
    if (self::$strLimits['pass_hi'] < strlen($fullname)) {
      if ($opt_die)
        raise_error('Fullname is more than ' . self::$strLimits['fname_hi'] . ' characters. Please make it smaller');
      return false;
    }

    // check if empty
    if ('' == $fullname)
      return true;


    if (preg_match("/^[a-zA-Z -]+$/", $fullname) == 0) {
      if ($opt_die)
        raise_error('Fullname is not valid, only dashes (-) and spaces are allowed');
      return false;
    }
    return true;
  }

// method CheckFullName

  /**
   * Address must be latin characters, numbers or one of the following _ - . , : '
   * code snippet from: http://www.phpjabbers.com/phpexample.php?eid=27
   *
   * @param string $location
   * @return boolean
   */
  public function CheckLocation($location) {

    //check size
    if (50 < strlen($location)) {
      return false;
    }
    if (preg_match("/^[a-zA-Z0-9 \_\-.,:\"\']+$/", $location) === 0) {
      return false;
    }
    return true;
  }

// method CheckLocation

  /**
   * Uri validation
   * regexp from: http://www.blog.highub.com/regular-expression/php-regex-regular-expression/php-regex-validating-a-url/
   *
   * @param string $homepage
   * @return boolean
   */
  public static function CheckUrl($homepage) {
    //check max size
    if (450 < strlen($homepage)) {
      return false;
    }

    //if (preg_match("/^((http|https):\/\/|www\.)[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?/", $urltocheck)) { echo "Pass"; return 1; } print "invalid"; return 0;
    // From user comments
    // if (preg_match("^((http|https):\/\/|www\.)[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?", $homepage)) {
    //orig
    //if (preg_match("^(http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?", $homepage)) {
    // http://flanders.co.nz/2009/11/08/a-good-url-regular-expression-repost/
    //if (preg_match("^(?#Protocol)(?:(?:ht)tp(?:s?)\:\/\/|~\/|\/)?(?#Username:Password)(?:\w+:\w+@)?(?#Subdomains)(?:(?:[-\w\d{1-3}]+\.)+(?#TopLevel Domains)(?:com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2})?)(?#Port)(?::[\d]{1,5})?(?#Directories)(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?#Query)(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?#Anchor)(?:#(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)?$", $homepage)) {
    //http://www.blog.highub.com/regular-expression/php-regex-regular-expression/php-regex-validating-a-url/
    $pattern = '/^(([\w]+:)?\/\/)?(([\d\w]|%[a-fA-f\d]{2,2})+(:([\d\w]|%[a-fA-f\d]{2,2})+)?@)?([\d\w][-\d\w]{0,253}[\d\w]\.)+[\w]{2,4}(:[\d]+)?(\/([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)*(\?(&amp;?([-+_~.\d\w]|%[a-fA-f\d]{2,2})=?)*)?(#([-+_~.\d\w]|%[a-fA-f\d]{2,2})*)?$/';

    if (!preg_match($pattern, $homepage)) {
      // if in devel return true cause we use .local which is not a valid url
      if(DEVEL) return true;
      
      return false;
    }
    return true;
  }

// method CheckUrl

  function CheckSimple($string, $what = '') {
    //checks if $string contains only letters or numbers (used for inv_pass)
    $i = 0;

    while ($ch = substr("$string", $i, 1)) {
      if (!strstr('QWERTYUIOPASDFGHJKLZXCVBNM01234567890qwertyuiopasdfghjklzxcvbnm', $ch)) {
        if ($what == '') {
          return FALSE;
        } else {
          return $ch;
        }
      }

      $i++;
    } //while


    return TRUE;
  }

//function CheckSimple

  /**
   * Will validate a bounds string and return it packed and new
   *
   * We expect 4 numbers which are SW Lat/Lng, NE Lat/Lng
   * Seperated by comma (,)
   * We return it switched:
   * NE Lat/Lng, SW Lat/Lng
   *
   * @param string $bounds
   * @return array or false
   */
  public function Bounds($bounds) {
    //check if it's an array
    if (!is_string($bounds))
      return false;

    //break up the bounds
    $bounds = explode(',', $bounds);
    //check if we have 4 values
    if (4 <> count($bounds))
      return false;

    //extract values
    $sw_lat = (float) $bounds[0];
    $sw_lng = (float) $bounds[1];
    $ne_lat = (float) $bounds[2];
    $ne_lng = (float) $bounds[3];

    //do real geo bounds test
    if (-90 > $ne_lat || 90 < $ne_lat)
      return false;
    if (-90 > $sw_lat || 90 < $sw_lat)
      return false;
    if (-180 > $ne_lng || 180 < $ne_lng)
      return false;
    if (-180 > $sw_lng || 180 < $sw_lng)
      return false;


    return array($sw_lat, $sw_lng, $ne_lat, $ne_lng);
  }

// method Bounds

  /**
   * Will validate a point string and return it packed and new
   *
   * We expect 2 numbers which are Lat/Lng seperated by comma (,)
   *
   * @param string $point
   * @return array or false
   */
  public function Point($point) {
    //check if it's an array
    if (!is_string($point))
      return false;

    //break up the point
    $point = explode(',', $point);
    //check if we have 2 values
    if (2 <> count($point))
      return false;

    //extract values
    $lat = (float) $point[0];
    $lng = (float) $point[1];

    //do real geo bounds test
    if (-90 > $lat || 90 < $lat)
      return false;
    if (-180 > $lng || 180 < $lng)
      return false;
    return array($lat, $lng);
  }

// method Point

  /**
   * Password validation.
   * We expect an array with 2 elements: 'password1' and 'password2'
   * (we usualy pass all the clients vars...)
   * Checks Against:
   * - Both vars isset
   * - Vars are similar
   * - password has proper min/max size
   *
   * We assign the encrypted password in the clsUser data object
   *
   * @param array $vars 'password1', 'password2'
   * @param array $lang The 'user' language tree
   * @return boolean
   */
  public function CheckPassword($vars) {
    global $Err, $loader, $eye_db, $lang;

    /**
     * PASSWORD Validation
     */
    if (!isset($vars['password'])) {
      // we may be in profile password edit, so we would expect
      // password1 and password2
      if (!isset($vars['password1'])) {
        $Err->err(20, $lang['user']['register']['no_password'], 'password1 variable is not set', 301);
        return false;
      }
      if (!isset($vars['password2'])) {
        $Err->err(20, $lang['user']['register']['no_password'], 'password2 variable is not set', 301);
        return false;
      }

      // check if the two passwords match
      if ($vars['password1'] <> $vars['password2']) {
        $Err->err(10, $lang['user']['profile']['pass_nomatch'], 301);
        return false;
      }
      $vars['password'] = $vars['password1'];
    } // if $vars['password'] is not set
    //get the password string without escaping slashes
    $pass = stripslashes($vars['password']);

    //check for sizes now
    if ($this->strLimits['pass_lo'] > strlen($pass)) {
      $Err->err(10, $lang['user']['register']['password_min'], '', 301);
      return false;
    }
    if ($this->strLimits['pass_hi'] < strlen($pass)) {
      $Err->err(10, $lang['user']['register']['password_max'], '', 301);
      return false;
    }

    //check if password too common using our weak pass array
    if (in_array($pass, $this->clsUser->clsDobj->BannedPasswords)) {
      $Err->err(10, $lang['user']['register']['pass_weak'], '', 301);
      return false;
    }

    //password is cleared, crypt-assign it
    $this->clsUser->clsDobj->user['password'] = HashString($vars['password'], true);

    return true;
  }

// method CheckPassword

  /**
   * E-mail Validation
   * We expect an array that contains the element 'email'.
   *
   * We will check:
   * - Var isset
   * - String evaluates as an email
   * - Email already exists in our DB
   *
   * @param array $vars
   * @param boolean $checkAvail [optional] if true we perform email availability check
   * @param boolean $opt_die [optional] If true we die on error
   * @return boolean
   */
  public static function CheckEmail($email, $checkAvail = false, $opt_die = false) {

    /**
     * EMAIL Validation
     *
     */
    //do the string evaluations and proper string length
    if (!self::CheckEmailValidity($email, false)) {
      if ($opt_die)
        raise_error('Please enter a valid e-mail');
      return false;
    }

    //check if email exists
    if ($checkAvail) {
      $CI = & get_instance();
      if ($CI->user->emailExists($email)) {
        if ($opt_die)
          raise_error('e-mail already exists');
        return false;
      }
    }
    return true;
  }

// method CheckEmail

  /**
   * Will validate an incoming spot name
   *
   * @param string $spotName
   * @return string|boolean false if fail
   */
  public function CheckSpotName($spotName) {
    global $Err;
    $spotName = $this->RipString($spotName, $this->conf->LengthLimits['spot_name']);
    if (0 == strlen($spotName)) {
      $Err->err('10', 'Spot Name is empty');
      return false;
    }
    //
    //$spotName = htmlspecialchars($spotName);

    return $spotName;
  }

// method CheckSpotName

  /**
   * Will validate incoming spot's personal note
   *
   *
   * @param string $note
   * @return string
   */
  public function CheckSpotPersonalNote($note) {
    $note = $this->RipString($note, __DB_SPOT_SHORT_DESCRIPTION_LENGTH);

    return $note;
  }

// method CheckSpotPersonalNote

  /**
   * Will validate incoming spot's tags
   *
   *
   * @param string $tags
   * @return string
   */
  public function CheckSpotTags($tags) {
    $tags = $this->RipString($tags, __DB_TAGS_MAX_LENGTH_ALLOW);

    return $tags;
  }

// method CheckSpotTags

  /**
   * Validate if passed variable is a valid
   * external source
   *
   * @param number|array $mixed a single sourceId or array of...
   * @return boolean
   */
  public function ExtSources($mixed) {
    global $gaExtSources;

    if (is_array($mixed)) {
      foreach ($mixed as $value) {
        if (!in_array($value, $gaExtSources))
          return false;
      }
    } else {


      foreach ($gaExtSources as $sourceId) {
        if ($mixed !== $sourceId)
          return false;
      }
    }
    return true;
  }

// ExtSources
}

//Valid Class
?>