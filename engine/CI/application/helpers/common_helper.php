<?php
/**
*  @copyright  (C) 2000-2011 Thanasis Polichronakis - All Rights Reserved - except core code from google API
*  @author Thanasis Polichronakis <thanasisp@gmail.com>
*
*********
*  Generic Functions
*
*
*********
* This program is bound to the license agreement that can be found in the root
* folder of this project. This Agreement does not give you any intellectual property
* rights in the program. It does not Grand you permission to copy, distribute, redistribute
* or make any possible use of this program, this is a private work intended for private use.
*
* You should have received a copy of the License Agreement along with this program
* If not, write to: Plastikopiitiki S.A., Attn: Thanasis Polichronakis, P.O. Box 60374,
* Zip 57001, Thermi, Greece
*
*
*********
* @version $Id: $
* @filesource
* @createdate 27/May/2011
*
*/


    /**
     * Wrapper for print_r, prints pre /pre before and after
     *
     * @param array $arr The array
     * @param boolean $return_value [optional] If true returns value
     * @return mixed
     */
    function debug_r($arr, $return_value = false)
    {
    	$return = '<pre>';
    	$return .= print_r($arr, true);
    	$return .= '</pre>';

    	if ($return_value)
    	    return $return;
    	else
    	    echo $return;
    }

    /**
     * Null-ifies all the keys in an array recursively to the last dimention.
     *
     * @param array $arr The array we want to nullify
     * @return array The array with all the values set to null
     */
    function array_null($arr)
    {
    	//if not an array return the whatever that parameter is
    	if(!is_array($arr)) return $arr;

    	foreach($arr as $key => $value)
    	{
    		if(is_array($value))
    		{
    			//recurse
    			$value = array_null($value);
    		}//if $value is array
    		else {
    			$arr[$key] = null;
    		} //else $value is not an array
    	} //foreach $arr

    	return $arr;
    } //function array_null


	/**
	 * Wraps the string in single quotes
	 * and secureSQLInjects it
	 *
	 * @param string $string The string
	 * @param boolean $secureSQLin if true we also perform secure sql injection to the string
	 * @return string
	 */
	function sq($string, $secureSQLinj = false) {
		global $eye_db;

		if ($secureSQLinj) {
			//$string = $eye_db->SecureSQLInject($string);
		}
		return '\'' . $string . '\'';
	}


	/**
	 * Will Convert special characters to HTML entities
	 *
	 * @param string $string
	 * @return string
	 */
	function ht($string) {
		//return rawurlencode ($string);
		return htmlspecialchars ($string);
	}

    /**
     * Will convert a date to the user's timezone
     *
     * If the user is logged in ofcourse...
     * All mysql dates must pass through this function
     *
     * @param string|timestamp $datetime A mysql formatted date or time()
     * @return string A timezone correct date
     */
    function dttz ($datetime)
    {
    	if (is_numeric($datetime)) {
    		$time = $datetime;
    	} else {
            $time = strtotime($datetime);
    	}

        // emulate DATE_RFC822 , PHP's is broken, returns years in two digits
        // Wed, 02 Oct 2002 15:00:00 +0200
        $ret = date('D, d M Y H:i:s O', $time + date("Z", $time));
        //logevent(0,0, "dttz datetime: $datetime returning: $ret");
        return $ret;
    } // function dttz


    /**
     * Rolls the dice and replies with true false
     *
     * Set the probabilty in a float from 0 to 1
     *
     * Currently only 2 decimals
     *
     * @param float $percent Probability factor (0 to 1)
     * @return boolean
     */
    function run_random($percent)
    {
      if (1 <= $percent)
        return true;

      if (0 >= $percent)
        return false;

      $value = (int) $percent * 100;

      if ($value < rand(1,100))
        return true;
      return false;
    }

    /**
     * Turns a given string into a hash .
     *
     * We salt the string provided with our hidden string
     * and a timestamp. If we need to staticly hash a string
     * (e.g. no timestamp) set second parameter to 'true'
     *
     * @param string $string The salt we want to use
     * @param boolean $opt_bare [optional] if true we hash staticly
     * @return string
     */
	function HashString($string, $opt_bare = false) {
        global $config;

        if (!$opt_bare) {
            $mtime = microtime();
            $mtime = explode(' ',$mtime);
            $hash_time = $mtime[1] + $mtime[0] . time();
        } else {
            $hash_time = '';
        }

        //add salt to string
        $hash_parts = $string . $hash_time . $config['encryption_key'];


        return hash('sha256', $hash_parts);
    }


	/**
	 * Returns the domain name of current site.
	 * e.g. for www.spotdaspot.com we get spotdaspot.com
	 * or localhost we get localhost
	 * or www.subdomain.wherever.spotdaspot.com we get spotdaspot.com
	 *
	 * We use this method for setting cookies
	 *
	 * @return string
	 */
	function GetDomain()
	{
        // fetch HTTP HOST and explode it using dot (.)
        $tmpdom2 = explode(".",getenv("HTTP_HOST"));
        $cnt = count($tmpdom2) ;
        if (1 < $cnt) {
            return $tmpdom2[$cnt-2].'.'.$tmpdom2[$cnt-1];
        } else {
        	return getenv("HTTP_HOST");
        }

	} // method GetDomain


  /**
   * We will search in an array that contains arrays
   * if the key of the arrays contained match the value given.
   *
   * We will then return the $key that matched our search
   *
   * @param array $ar Master array we want to search for
   * @param string $key what's the key name we will search the values for
   * @param mixed $value the value we are looking for
   * @param boolean $opt_ret_array [optional] instead of key return data
   * @return int|null|array The key we found a match for or null if not found
   *      the array value if $opt_ret_array is set to true
   */
  function array_find_key($ar, $key, $value, $opt_ret_array = false)
  {
    foreach($ar as $ourKey => $arrayValue) {
      if ($arrayValue[$key] == $value)
        if ($opt_ret_array)
          return $arrayValue;
        else
          return $ourKey;
    }
    return null;
  }

?>