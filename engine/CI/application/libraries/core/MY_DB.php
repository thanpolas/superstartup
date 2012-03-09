<?php

/**
 *  @copyright  (C) 2000-2011 Thanasis Polychronakis - All Rights Reserved
 *  @author Thanasis Polychronakis <thanasisp@gmail.com>
 *
 * ********
 *
 *
 * ********
 * created on Jun 3, 2011
 * MY_DB.js Extension functions to CI's DB library
 *
 */
class MY_DB {

  /**
   * We will parse an array that was filled by $this->GetResultArray
   * and return the values of $key provided in a string for use in the
   * 'IN' statement of SQL Queries
   *
   * @param array $arr The Results array
   * @param string $key [optional] The key that we want extracted
   * @return string If we fail we return an empty string
   */
  public static function getValuesForInclusion($arr, $key = "") {

    if (!is_array($arr))
      return '(' . (is_string($arr) ? sq($arr) : $arr) . ')';

    $_out = '(';
    foreach ($arr as $value) {
      if ("" == $key) {
        $v = $value;
      } else {
        $v = $value[$key];
      }

      //check against strings
      if (is_string($v)) {
        $_out .= sq($v) . ', ';
      } else {

        $_out .= $v . ', ';
      }
    } // foreach item in array
    // if we didn't have any results, return empty string
    if (2 > strlen($_out))
      return '';

    //cut out the last ', ' value...
    $_out = substr($_out, 0, -2);

    $_out .= ')';

    return $_out;

    // method GetValuesForInclusion
  }

  /**
   * Will recursivly search for null values in the array
   * provided and reset them to strings
   *
   * @param array $array
   * @return array The resulting array
   */
  public static function removeNull($array) {
    if (!is_array($array)) {
      return $array;
    }
    //clear the values off of nulls now...
    foreach ($array as $k => $v) {
      if ($v == null)
        $array[$k] = '';
      if (is_array($v)) {
        $array[$k] = $this->removeNull($v);
      }
    }
    return $array;

    // method RemoveNull
  }

  /**
   * Will return an array with all the resultset from the DB. We use this method
   * so we can remove the last null value comming from the single liner while loop.
   *
   * We assume that the query has been checked against errors on execution!
   *
   *  Now we can single line get the whole dataset
   *
   * @param object $query Result from CI DB class
   * @return array or false if 0 results
   */
  public static function getResultArray($query) {
    $_res = array();

    //if zero results, return false
    if (0 == $query->num_rows())
      return false;


    //if 1 result return as is
    if (1 == $query->num_rows()) {
      list($_res) = $query->result_array();
      return array(0 => $_res);
    }


    foreach($query->result_array() as $_res[]);


    //remove the last null record now...
    // Don't! Doesn't exist any more
    //$_res = array_slice($_res, 0, -1);

    //die(debug_r($_res));
    
    if (count($_res))
      return $_res;
    else
      return array(); // no results


//function getResultArray
  }


    /**
     * Will set the databases time zone
     * Default is GMT and for the geowarp project
     * should remain like that...
     *
     * Use only for MYSQL
     *
     * @param string $offset A mysql type offset '-0:00'
     * @return string
     */
    public static function SetTimeZone($offset = '-0:00')
    {
    	$SQL = 'SET time_zone = ' . sq($offset);
      return $SQL;

    	//return $this->Query($SQL);
    }


// class MY_DB
}

?>