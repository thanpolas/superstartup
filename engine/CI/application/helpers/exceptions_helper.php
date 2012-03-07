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
 * created on Jun 1, 2011
 * Exceptions_helper.php [File Description]
 *
 */

  /**
   * Custom error handling for error messages to be displayed
   * to the user
   *
   * We display the error message either in HTML / JSON depending
   * on environment, we also accept a debug-only message that is
   * used only for development
   *
   * @param string $message
   * @param string $opt_debug [optional] optioaly supply additional info for debuging purposes
   * @param boolean $opt_log [optional] If set to true we also perform a PHP error log
   * @return void we die
   */
	function raise_error($message, $opt_debug = '', $opt_log = false)
	{
    //TODO implement html errors and display debug info

    $deb = debug_backtrace();
    $file = $deb[0]['file'];
    $line = $deb[0]['line'];
    $func = $deb[0]['function'];
    if ('development' == ENVIRONMENT) {
      $message .= ' ' . $file . ':: Line ' . $line . '::' . $opt_debug;
    }

    // check if we want to log to PHP
    if ($opt_log) {
      log_message('error', $file . '::Line ' . $line . '::' . $opt_debug);
    }

		$_error =& load_class('Exceptions', 'core');
		echo $_error->ajax_error($message);

	}
?>