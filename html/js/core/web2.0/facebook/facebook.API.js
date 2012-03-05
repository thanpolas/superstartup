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
 * @createdate 01/Nov/2010
 *
 *********
 *  File:: web2.0/facebook/facebook.API.js
 *  wrapper for the FB js API
 *********
 */



goog.provide('core.fb.API');
goog.require('core.STATIC');


/**
 * The core of the facebook API calls
 * We use restAPI for these functions
 * for now
 *
 * @constructor
 */
core.fb.API.core = function ()
{

}; // class core.fb.API.core

/**
 * The post API class
 *
 *
 * If you want to debug posting on a JS console:
 *
 * FB.api({method:'stream.publish', auto_publish:false, message:'asd add  dd',attachment:{name:'ddd', caption:'deeee', href:'http://chat.local/b/booth_10556'}}, function(e){console.debug(e)})
 *
 * @constructor
 */
core.fb.API.post = function ()
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
    }
    this.savedId = null;
    this.paramsAPI = null;

    } catch(e) {core.error(e);}
}; // class core.fb.API.post

/**
 * With this method we set all the needed
 * parameters to make the call for the post
 *
 *  Sample of parameters:

    properties: [
      { text: 'fbrell', href: 'http://fbrell.com/' }
    ],
    picture: 'http://boothchat.com/img/boothchat_logo.png',
    caption: 'this is caption',
    description:'this is description',
    name: 'Join me now',
    actions: [{name: 'action one', link: 'http://boothchat.com'}],
    link: 'http://boothchat.com/pages/about'

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
core.fb.API.post.prototype.setParams = function (params)
{
    try {

    this.paramsAPI = params

    this.paramsAPI['method'] = 'feed';
    //this.paramsAPI['display'] = 'popup';


    } catch(e) {core.error(e);}
}; // method core.fb.API.post.setParams

/**
 * Perform actual post of the post we have created
 *
 * @param {Function(boolean, string)} listener with state and error message or post ID
 * @return {void}
 */
core.fb.API.post.prototype.perform = function (listener)
{
    try {
    var g = goog;
    var w = core;

    var log = w.log ('core.fb.API.post.perform');

    log.info('Init');

    // check if on mobile and execute a bit differently...
    if (w.MOBILE) {
        Titanium.Facebook.execute('stream.publish', this.paramsAPI,
            g.bind(function(res){
                if (res['success'])
                    log.info('POST SUCCESS TO FACEBOOK');
                else
                    log.info('POST FAIL TO FACEBOOK');
            }, this), null);



        return;
    } // if on mobile

    var fb = FB;
    if (this.db.editBeforePost)
        var action = fb.ui;
    else
        var action = fb.api;





    // perform action
    action(this.paramsAPI, g.bind(function (res){
        // if mode is edit before post then on error
        // res will be null
        if (g.isNull(res) || !g.isDef(res)) {
            log.warning('Error from facebook. res is null');
            listener(false, w.errmsg);
            return;
        }

        if (g.isObject(res['error'])) {
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

    } catch(e) {core.error(e);}
}; // method core.fb.API.post.perform







/**
 * Define if we want to edit before posting (true / default)
 * or direct posting to facebook (false)
 *
 * @param {boolean} value
 * @return {void}
 */
core.fb.API.post.prototype.setEditBeforePost = function (value)
{
    if (goog.isBoolean(value))
        this.db.editBeforePost = value;

}; // method setEditBeforePost
