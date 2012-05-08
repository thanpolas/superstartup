/**
 * Copyright 2000-2011 Athanasios Polychronakis. Some Rights Reserved.
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
 * @author Athanasios Polychronakis <thanpolas@gmail.com>
 * createdate 20/Aug/2010
 *
 *********
 *  File:: web2.0/facebook/facebook.comments.js
 *  wrapper for the FB comments API
 *********
 */



goog.provide('ss.fb.com');



/**
 * Listen for comment create events
 *
 * @param {object} event FB passed object
 * @return {void}
 */
ss.fb.com.create = function (event)
{
  try {
    var c = ss, g = goog;

    var log = c.log('ss.fb.com.create');

    log.info('Init');

    /**
     * Our passed variables are:
     * commentID :: string (id number)
     * href :: Url of object that was commented
     * parentCommentId :: undefined|string (id number)
     *
     */

     // inform server
     c.fb.local.commentCreate(event);

     // track event
     c.analytics.trackEvent('comments', 'created');
     c.analytics.trackSocial('facebook', 'comment', event.href);
     
  } catch (e) {
    ss.error(e);
  }

}; // ss.fb.com.create

/**
 * Listen for comment remove events
 *
 * @param {object} event FB passed object
 * @return {void}
 */
ss.fb.com.remove = function (event)
{
  try {
    var c = ss, g = goog;

    var log = c.log('ss.fb.com.remove');

    log.info('Init');
    /**
     * Our passed variables are:
     * commentID :: string (id number)
     * href :: Url of object that was commented
     */

     // inform server
     c.fb.local.commentCreate(event, true);
     // track event
     c.analytics.trackEvent('comments', 'removed');
     c.analytics.trackSocial('facebook', 'commentRemoved', event.href);


  } catch (e) {
    ss.error(e);
  }

}; // ss.fb.com.remove


/**
 * A simple getter for the FB comments html tag
 *
 * params can have any of the following:
 * width :: Number, default 500
 * num_posts :: Number, default 2
 * colorscheme :: String light, dark. Default light
 *
 * @param {string} href The url we are attaching the comments on
 * @param {object=} opt_params Additional parameters as described above
 * @return {string}
 */
ss.fb.com.getElement = function (href, opt_params)
{
  try {

  var p = opt_params || {};
  var params = {
    posts: p.num_posts || 2,
    width: p.width || 500,
    color: p.colorscheme || 'light'
  };

  var str = '<fb:comments href="' + href;
  str += '" num_posts="' + params.posts + '" ';
  str += 'width="' + params.width + '" ';
  str += 'colorscheme="' + params.color + '"';
  str += '></fb:comments>';

  return str;

  } catch (e) {
    ss.error(e);
  }


};