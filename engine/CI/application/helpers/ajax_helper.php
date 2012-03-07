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
 * ajax_helper.php [File Description]
 *
 */

/**
 * Very simple function to echo our JSON responce
 * and die.
 *
 * User for AJAX
 * @param array $return
 * @return void we die
 */
function die_json($return)
{

  $CI = & get_instance();

  $arInject = $CI->main->getInjectData();

  // check if we have hi-jack injection of data
  if (count($arInject)) {
    // we do, push them in.. we overwrite
    foreach ($arInject as $object) {
      foreach ($object as $key => $value)
        $return[$key] = $value;
    }
  }

  $json = _json_encode($return);
  // http://www.php.net/manual/en/function.json-encode.php#100265
  //$json = preg_replace('/"([a-zA-Z]+[a-zA-Z0-9]*)":/', '$1:', json_encode($return));
  echo $json;
  die();
  //die(json_encode($json);
}

/**
 * Use this function for proper JSON encoding
 *
 * @param mixed $value any value
 * @return string JSON encoded object
 */
function _json_encode($value) {
  // tip from:
  //http://stackoverflow.com/questions/2870872/escaping-escape-characters
  if (version_compare(PHP_VERSION, '5.3.0', '>=') === true)
    $ret = json_encode($value, JSON_HEX_APOS | JSON_HEX_QUOT);
  else
    $ret = str_replace(array(), array('\\u0022', '\\u0027'),json_encode($value));

  return $ret;
}

?>