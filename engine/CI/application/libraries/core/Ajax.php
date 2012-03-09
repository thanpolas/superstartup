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
 * createdate 18/Feb/2010
 *
 */
class Ajax {


  /**
   * We use this private parameter for injecting key:value pairs
   * into the output of the server to the client...
   *
   * Used mostly in cases of events, credential failures...
   *
   * @var array
   */
  private $arInject = array();
  private $ci = null;

  function __construct() {
    $this->ci = & get_instance();
  }

  /**
   * Will return a proper JSON string based on the array provided
   * @param array $arr
   * @return string JSON string
   */
  public function GetJsonResult($arr) {
    if (is_array($arr))
      $array = $arr;
    else
      $array = array($arr => true);

    return _json_encode($array);
  }

//method GetJsonResult

  /**
   * Wrapper for GetXmlResult and GetJsonResult
   * Returns a formated string for outputing when in AJAX
   * based on user request preference (XML or JSON)
   *
   * If we have an error in the global Err class, and need to
   * display it, simply call this method with no parameters
   *
   * @param array [optional] $arr The array of values we want to parse
   * @param string $force_type [optional] if we want to force the return type (use: 'xml', 'json', 'php')
   * @return string The formated string
   */
  public function GetResult($arr = array(), $force_type=FALSE) {
    global $gsTypeSend, $Err;

    // check if we have hi-jack injection of data
    if (count($this->arInject)) {
      // we do, push them in.. we overwrite
      foreach ($this->arInject as $object) {
        foreach ($object as $key => $value)
          $arr[$key] = $value;
      }
    }

    // if we are on server force JSON return for now...
    return $this->GetJsonResult($arr);

    // method GetResult
  }

  /**
   * Returns a javascript string that will execute the generic JS function
   * spt.system.tagLander($params).
   *
   * This javascript tag will be echoed in a frame so we use proper scope
   * declaration for this (window.top)
   *
   * $params will be an object tree with needed variables based on $params['action'].
   *
   * @param array $object The PHP array object we want to pass as parameters to JS
   * @return string The Js script
   */
  public function GetJsTag($object) {


    //Start with the proper html / script tag
    $out = '<html><head><script language="javascript" type="text/javascript">(function(){';

    //convert to JSON the PHP array
    if (!$json = $this->GetJsonResult($object)) {
      return false;
    }

    //set the parameters to a JS var
    $out .= 'var tmp = [' . $json . '];';

    //execute the function now
    $out .= 'window.top.window.spt.system.tagLander(tmp);';

    //execute the parsing of the passed tags
    $out .= 'window.top.window.spt.system.tagLanderParse();';

    //close the tag and return it
    $out .= '})();</script></head><body></body></html>';



    return $out;
    //function GetJsResultUser
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
    $this->arInject[] = $object;
    // method InjectData
  }

// class Ajax
}

?>