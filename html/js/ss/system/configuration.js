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
 * createdate 25/May/2011
 *
 *********
 *  File:: system/configuration.js
 *  Core configurations for website / application
 *********
 */

goog.provide('ss.conf');

/**
 * Master configuration hash
 *
 * @type {Object}
 */
ss.conf = {
  /** @type {Object} third party integrations */
  ext: {},
  /** @type {Object} user related configurations */
  user: {
    /** @type {Object} user related configurations */    
    typeMappings: {}
  }
};

/** @type {Object} Authentication related confs */
ss.conf.auth = {
  /** 
   * @param {boolean} If we want to perform local auth with our servers
   *    on external source auth events
   */
  performLocalAuth: false
  
};

/** @type {Object} External authentication related confs */
ss.conf.auth.ext = {
  /**
   * When an external auth source changes state and becomes authenticated
   * we use this URL to inform the server.
   */
  authUrl: '/users/extAuth',
  /**
   * @param {string} The string literal to use when posting the sourceId to the server
   */
  localAuthSourceId: 'sourceId'
};

/** @type {Object} Facebook auth plugin */
ss.conf.auth.ext.fb = {
  app_id: '186392014808053',
  permissions: 'email,publish_stream'  
};

/** @type {Object} Twitter auth plugin */
ss.conf.auth.ext.twttr = {
  loginUrl: '/users/twitter',
  loginLinkAccountParams: '?link=1', // use when user wants to link account not login
  twttrPoll: null,
  target: null  
};

/**
 * A mapping of keys for a public user's data object
 *
 * @enum {string}
 */
ss.conf.user.typeMappings.user = {
  id: 'id',
  username: 'username',
  firstName: 'firstName',
  lastName: 'lastName',
  fullName: 'fullName',
  createDate: 'createDate',
  hasExtSource: 'hasExtSource',
  extSource: 'extSource'
};

/**
 * A mapping of the keys in the external auth source items DO
 * @enum {string}
 */
ss.conf.user.typeMappings.extSource = {
  sourceId: 'sourceId',
  userId: 'userId',
  profileUrl: 'profileUrl',
  username: 'username',
  profileImageUrl: 'profileImageUrl'
};

/**
 * An extension to ss.user.types.user for the currently logged
 * in user's data object. Contains keys that are only available to 
 * the owner of this data object
 * @enum {string}
 */
ss.conf.user.typeMappings.ownuser = {
  email: 'email',
  verified: 'verified'
};



