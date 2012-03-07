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
 *
 * ********
 * created on Jun 10, 2011
 * MY_date.php [File Description]
 *
 */

/**
 * Will return human readable time since starting date
 * e.g. 5 minutes 40 seconds ago
 *
 * Code from: http://gr.php.net/manual/en/dateinterval.format.php#96768
 *
 *
 * @param DateTime $start
 * @param DateTime $end [optional]
 * @return string
 */
function getTimeAgo($start, $end = null)
{


    $endtime = standard_date('DATE_ISO8601', now() - 14400 );
    $ar = get_time_difference($start, $endtime);

    $ret = '';
    //'days'=>$days, 'hours'=>$hours, 'minutes'=>$minutes, 'seconds'=>$diff) );

    if ($ar['days']) {
      return $ar['days'] . 'd ' . $ar['hours'] . 'h';
    }

    return $ar['hours'] . 'h ' . $ar['minutes'] . 'm';



    // this code doens't play on the server...


    if(!($start instanceof DateTime)) {
        $start = new DateTime($start);
    }

    if($end === null) {
        $end = new DateTime();
    }

    if(!($end instanceof DateTime)) {
        $end = new DateTime($start);
    }

    $interval = $end->diff($start);
    //$doPlural = function($nb,$str){return $nb>1?$str.'s':$str;}; // adds plurals

    $format = array();
    if($interval->y !== 0) {
        $format[] = "%y ".doPlural($interval->y, "year");
    }
    if($interval->m !== 0) {
        $format[] = "%m ".doPlural($interval->m, "month");
    }
    if($interval->d !== 0) {
        $format[] = "%d ".doPlural($interval->d, "day");
    }
    if($interval->h !== 0) {
        $format[] = "%h ".doPlural($interval->h, "hour");
    }
    if($interval->i !== 0) {
        $format[] = $interval->i . "min";
    }
    if($interval->s !== 0) {
        if(!count($format)) {
            return $interval->s . "s";
        } else {
            $format[] = $interval->s . "s";
        }
    }

    // We use the two biggest parts
    if(count($format) > 1) {
        $format = array_shift($format)." ".array_shift($format);
    } else {
        $format = array_pop($format);
    }


    // Prepend 'since ' or whatever you like
    return $interval->format($format);

}

function doPlural($nb,$str){return $nb>1?$str.'s':$str;};


/**
 * Function to calculate date or time difference.
 *
 * Function to calculate date or time difference. Returns an array or
 * false on error.
 *
 * @author       J de Silva                             <giddomains@gmail.com>
 * @copyright    Copyright &copy; 2005, J de Silva
 * @link         http://www.gidnetwork.com/b-16.html    Get the date / time difference with PHP
 * @param        string                                 $start
 * @param        string                                 $end
 * @return       array
 */
function get_time_difference( $start, $end )
{
    $uts['start']      =    strtotime( $start );
    $uts['end']        =    strtotime( $end );
    if( $uts['start']!==-1 && $uts['end']!==-1 )
    {
        if( $uts['end'] >= $uts['start'] )
        {
            $diff    =    $uts['end'] - $uts['start'];

            if( $days=intval((floor($diff/86400))) )
                $diff = $diff % 86400;
            if( $hours=intval((floor($diff/3600))) )
                $diff = $diff % 3600;
            if( $minutes=intval((floor($diff/60))) )
                $diff = $diff % 60;
            $diff    =    intval( $diff );
            return( array('days'=>$days, 'hours'=>$hours, 'minutes'=>$minutes, 'seconds'=>$diff) );
        }
        else
        {
            //trigger_error( "Ending date/time is earlier than the start date/time", E_USER_WARNING );
        }
    }
    else
    {
        //trigger_error( "Invalid date/time data detected", E_USER_WARNING );
    }
    return( false );
}

/**
 * Returns the time difference in string
 * in the form 1 minute ago,3 hours ago etc
 *
 * @param boolean $opt_short true if we want a short date
 * @param string $pastDate A datetime formated string from mysql
 * @return string
 */
function getDiffStringAgo ($opt_short,$pastDate)
{

  $phpdate = strtotime($pastDate);
  $phpnow = time();
  $diff = $phpnow - $phpdate;
  $diff    =    intval( $diff );

   // more than a day ago
    if (86400 < $diff ){
      $phpPast=strtotime($pastDate);
      return date("M j",$phpPast);
    }


    if (60 > $diff) return $diff . ($opt_short ? 'secs' : ' seconds ago');
    if (120 > $diff) return ($opt_short ? '1 min' : 'about a minute ago');
    if (3600 > $diff) return ($opt_short ? floor($diff / 60) . ' min' : 'about ' . floor($diff / 60) . ' minutes ago');
    if (7200 > $diff) return ($opt_short ? '1 hour' : 'about an hour ago');
    if (86400 >= $diff) return ($opt_short ? floor($diff / 3600) . ' hours' : 'about ' . floor($diff / 3600) . ' hours ago');

  return '';
}

/**
 * Returns the time difference from now in
 * an array with the following keys:
 * years
 * months
 * days
 * hours
 * minutes
 * seconds
 *
 * @param mixed $compareDate A datetime formated string
 * @return array
 */
function getTimeDiffArray ($compareDate)
{

  $phpdate = strtotime($compareDate);
  $phpnow = time();
  $diff = $phpnow - $phpdate;

  if ($years = intval(floor($diff / 31449600)))
    $diff = $diff % 31449600;
  if ($months = intval(floor($diff / 2592000)))
    $diff = $diff % 2592000;
  if( $days=intval((floor($diff/86400))) )
      $diff = $diff % 86400;
  if( $hours=intval((floor($diff/3600))) )
      $diff = $diff % 3600;
  if( $minutes=intval((floor($diff/60))) )
      $diff = $diff % 60;
  $seconds    =    intval( $diff );

  return array (
    'years' => $years,
    'months' => $months,
    'days' => $days,
    'hours' => $hours,
    'minutes' => $minutes,
    'seconds' => $seconds
    );
/*
    $uts['start']      =    strtotime( $start );
    $uts['end']        =    strtotime( $end );
    if( $uts['start']!==-1 && $uts['end']!==-1 )
    {
        if( $uts['end'] >= $uts['start'] )
        {
            $diff    =    $uts['end'] - $uts['start'];

            if( $days=intval((floor($diff/86400))) )
                $diff = $diff % 86400;
            if( $hours=intval((floor($diff/3600))) )
                $diff = $diff % 3600;
            if( $minutes=intval((floor($diff/60))) )
                $diff = $diff % 60;
            $diff    =    intval( $diff );
            return( array('days'=>$days, 'hours'=>$hours, 'minutes'=>$minutes, 'seconds'=>$diff) );
        }
*/
  // This code will only work for PHP > 5.3
  // Current server is PHP ~5.2
  // this means BOLLOCKS!
      $last = new DateTime($compareDate);
      $now = new DateTime();
      $interval = $last->diff($now);

      return array (
        'years' => $interval->format('%y'),
        'months' => $interval->format('%m'),
        'days' => $interval->format('%d'),
        'hours' => $interval->format('%h'),
        'minutes' => $interval->format('%i'),
        'seconds' => $interval->format('%s')
        );
}

/**
 * Returns an array of days between two dates both ends incl.
 *
 * @param  string $ssStartDate time string in Y-m-d format
 * @param  string $sEndDate time string in Y-m-d format
 * @return array of days
 */
 function getDays($sStartDate, $sEndDate){

      $sStartDate = gmdate("Y-m-d", strtotime($sStartDate));
      $sEndDate = gmdate("Y-m-d", strtotime($sEndDate));

      $aDays[] = $sStartDate;
      $sCurrentDate = $sStartDate;

      while($sCurrentDate < $sEndDate){
        $sCurrentDate = gmdate("Y-m-d", strtotime("+1 day", strtotime($sCurrentDate)));
        $aDays[] = $sCurrentDate;
      }
      return $aDays;
    }


?>