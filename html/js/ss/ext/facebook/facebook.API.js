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
 * createdate 01/Nov/2010
 *
 *********
 *  File:: web2.0/facebook/facebook.API.js
 *  wrapper for the FB js API
 *********
 */



goog.provide('ss.fb.API');
goog.require('ss.CONSTS');

/**
 * The post API class
 *
 *
 * If you want to debug posting on a JS console:
 *
 * FB.api({method:'stream.publish', auto_publish:false, message:'asd add  dd',attachment:{name:'ddd', caption:'deeee', href:'http://ss.local/a/path'}}, function(e){console.debug(e)})
 *
 * @constructor
 */
ss.fb.API.post = function ()
{
    try {
    this.db = {
        editBeforePost: true,
        message: null,
        name: null,
        href: null,
        caption: null,
        properties: null,
        media: null
    };
    this.savedId = null;
    this.paramsAPI = null;

    } catch(e) {ss.error(e);}
}; // class ss.fb.API.post

/**
 * With this method we set all the needed
 * parameters to make the call for the post
 *
 *  Sample of parameters:

    properties: [
      { text: 'fbrell', href: 'http://fbrell.com/' }
    ],
    picture: 'http://superstartup.org/path/to/image.jpg',
    caption: 'this is caption',
    description:'this is description',
    name: 'Join me now',
    actions: [{name: 'action one', link: 'http://superstartup.org'}],
    link: 'http://superstartup.org/about'

    We automaticaly set the 'method' and 'display' values
 *
 *
 * For full documentation see:
 * https://developers.facebook.com/docs/reference/dialogs/feed/
 *
 *
 * @param {object} params as described above
 * @return {void}
 *
 */
ss.fb.API.post.prototype.setParams = function (params)
{
    try {

    this.paramsAPI = params;

    this.paramsAPI['method'] = 'feed';

    } catch(e) {ss.error(e);}
}; // method ss.fb.API.post.setParams

/**
 * Perform actual post of the post we have created
 *
 * @param {Function(boolean, string=)} listener with state and post ID or error message
 * @return {void}
 */
ss.fb.API.post.prototype.perform = function (listener)
{
    try {
    var log =  goog.debug.Logger.getLogger('ss.fb.API.post.perform');

    log.info('Init');

    if (this.db.editBeforePost)
        var action = FB.ui;
    else
        var action = FB.api;
    // perform action
    action(this.paramsAPI, goog.bind(function (res){
        // if mode is edit before post then on error
        // res will be null
        if (goog.isNull(res) || !goog.isDef(res)) {
            log.warning('Error from facebook. res is null');
            listener(false);
            return;
        }

        if (goog.isObject(res['error'])) {
            log.warning('Error from facebook:' + res['error']['message']);
            listener(false, res['error']['message']);
        } else {
            if (this.db.editBeforePost)
                this.savedId = res['post_id'];
            else
                this.savedId = res;
            log.info('Post ok to facebook. id:' + this.savedId);



            listener(true, this.savedId);
        }
    }, this));

    } catch(e) {ss.error(e);}
}; // method ss.fb.API.post.perform


/**
 * Define if we want to edit before posting (true / default)
 * or direct posting to facebook (false)
 *
 * @param {boolean} value
 * @return {void}
 */
ss.fb.API.post.prototype.setEditBeforePost = function (value)
{
    if (goog.isBoolean(value))
        this.db.editBeforePost = value;

}; // method setEditBeforePost
