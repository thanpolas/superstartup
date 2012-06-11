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
  /** @type {Object} Authentication related confs */
  auth: {},
  /** @type {Object} third party integrations */
  ext: {}
};

/** @type {Object} External authentication related confs */
ss.conf.auth.ext = {
  /**
   * When an external auth source changes state and becomes authenticated
   * we use this URL to inform the server.
   */
  authUrl: '/users/extAuth',
  // Set if we want to perform local auth from ext auth sources
  performLocalAuth: false,
  // The string literal to use when posting the sourceId to the server
  localAuthSourceId: 'sourceId',
  // ext auth sources configurations
  sources: {}
};

/** @type {Object} Facebook */
ss.conf.ext.fb = {
  app_id: '186392014808053',
  permitions: 'email,publish_stream'  
};
