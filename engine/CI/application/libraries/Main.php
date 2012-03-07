<?php

/**
 * Copyright 2000-2011 Athanasios Polychronakis. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 * 
 * @copyright  (C) 2000-2010 Athanasios Polychronakis - All Rights Reserved
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 *
 * ********
 * createdate 19/Feb/2010
 *
 */
class Main {


  /**
   * PHP Page runtime passed JS variables
   *
   * This array [if it has any values] is injected in the bottom of the DOM as a
   * javascript function with JSON Data. Will be available on
   * load
   *
   *
   * @var array
   */
  public $JsPassArray = array();

  private $jsInjectArray = array();

  private $ci = null;
  function __construct() {
    $this->ci = & get_instance();
  }

  /**
   * We use this method to inject data in our
   * AJAX response to the client.
   *
   * Use for special events, faulty credentials
   * ...
   *
   * @param array $object
   * @return void
   */
  public function InjectData($object) {
    $this->jsInjectArray[] = $object;
    // method InjectData
  }

  /**
   * Get the injected data array
   *
   * @return array
   */
  public function getInjectData()
  {
    return $this->jsInjectArray;
  }


  /**
   * Whenever we need to pass run-time variables to javascript
   * when we load up the whole page this is the method to do it.
   *
   * Photo uploads are welcome as well...
   *
   * When user needs to get a complete pageview some parameters
   * are needed to be passed to the JS engine to further complete
   * a procedure (e.g. when user lands for first time with a permanent
   * cookie, we have to turn on login cookie via JS on the first pageview)
   *
   * $action values:
   * 1 : Error
   * 5 : Core Environment consts
   * 10 : Default Langpack
   * 100 : Profile - Account Edit
   * 101 : Register Verify - Page Lander
   * 102 : Logged In - Page Lander
   * 103 : Auth Errors
   * 110 : Spot Photo upload
   * 120 : Session Data Array
   * 122 : ...
   *
   *
   * @param int $action The pass action
   * @param array $array_obj[optiona] However deep array you wish
   * @param boolean $opt_reset [optiona] If we need to reset the cache of jspass
   * @return void
   */
  public function JsPass($action, $array_obj = array('a' => 0), $opt_reset = false) {
    //echo " Passing action: $action ";
    if ($opt_reset)
      $this->JsPassArray = array();
    $this->JsPassArray[$action] = $array_obj;
  }

// method JsPass

  /**
   * returns an html script tag with whatever we need
   * to pass.
   *
   * Checks if we are in ajax mode and if there is anything to
   * echo.
   *
   * This method is called from master end.php file
   *
   * @param boolean $force [optiona] Do not check if in ajax
   * @param boolean $opt_framed [optional] If true we add window.top.window. to call method
   * @return void
   */
  public function JsPassGet($force = false, $opt_framed = false) {
    global $gbAjax, $clsAjax;

    //check if we have anything to pass
    if (!count($this->JsPassArray))
      return;

    //not in either, construct script tag
    $out = '<script type="text/javascript">(function(){';
    $out .= 'var params = [';


    //debug_r($this->JsPassArray);
    //echo " JS COUNT: " . count($this->JsPassArray) . "";
    //debug_r(array_keys($this->JsPassArray));
    //print_r(self::$JsPassArray);

    foreach ($this->JsPassArray as $k => $val) {
      $json = $this->ci->ajax->GetResult($val, 'json');
      $out .= '{"action":' . $k . ',"obj":' . $json . '},';

      //echo "\n\n Key: $k val: $val json: $json \n\n";
    } // foreach
    //remove trailing comma
    $out = substr($out, 0, -1);
    //close array tag and call tagLander
    $out .= '];';
    if ($opt_framed) {
      $out .= 'window.top.window.';
    }
    $out.= 'web.system.tagLander(params);';
    //close anon func and script tag
    $out .= '})();</script>';

    //reset jsArray
    $this->JsPassArray = array();

    //output the result
    return $out;
  }

// method JsPassGet

  /**
   * Will attempt to resolve a specific country code
   * to a complete, proper country name.
   *
   *   If we cannot resolve, we return false
   *
   * @param string $country_code two lettered country code or special 'int'
   * @return string or false
   */
  public function resolveCountryCode($country_code) {
    global $loader;
    $loader->LoadClass('common/country');
    $country = new Country();

    return $country->resolveCountryCode($country_code);
  }

// method resolveCountryCode

  /**
   * Will set the default timezone in PHP
   * using a time offset
   *
   * Code from:
   * http://www.php.net/manual/en/function.date-default-timezone-set.php#86950
   *
   * e.g.:
   * $main->set_tz_by_offset(-1);
   *
   * @param integer $offset
   * @return boolean
   */
  public function set_tz_by_offset($offset) {
    $offset = $offset * 60 * 60;
    $abbrarray = timezone_abbreviations_list();
    foreach ($abbrarray as $abbr) {
      foreach ($abbr as $city) {
        if ($city['offset'] == $offset) { // remember to multiply $offset by -1 if you're getting it from js
          date_default_timezone_set($city['timezone_id']);
          return true;
        }
      }
    }
    date_default_timezone_set("utc");
    return false;
  }

// method set_tz_by_offset

  /**
   * Will set
   *
   *
   * @param integer $offset
   */
  public function SetTimezones($offset = 0) {
    global $eye_db, $gOrigin;

    // force numeric
    $offset = $offset * 1;

    // PHP run the set timezone by offset
    $this->set_tz_by_offset($offset);

    /**
     * OBSOLETE code, mysql will be fixed on GMT
     *
      if (0 == $offset) {
      $tz = '-0:00';
      } else {
      // check for .5
      if (0.5 == ($offset - floor($offset))) {
      $sfx = ':30';
      } else {
      $sfx = ':00';
      }
      if (0 < $offset) {
      $tz = '+' . $offset . $sfx;
      } else {
      $tz = '-' . $offset . $sfx;
      }
      }

      // force timezone to database to GMT
      $eye_db->SetTimeZone($tz);
     */
    //logevent(0,0, "Setting offset: $offset origin: $gOrigin");
  }

// method SetTimezones
}

// class main
?>