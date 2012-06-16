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
 */
 
 
 
/**
 * A mapping of keys for a public user's data object
 *
 * @enum {string}
 *
ss.config.user.typeMappings.user = {
  id: 'id',
  username: 'username',
  firstName: 'firstName',
  lastName: 'lastName',
  fullName: 'fullName',
  createDate: 'createDate',
  hasExtSource: 'hasExtSource',
  extSource: 'extSource'
};

**
 * A mapping of the keys in the external auth source items DO
 * @enum {string}
 *
ss.config.user.typeMappings.extSource = {
  sourceId: 'sourceId',
  userId: 'userId',
  profileUrl: 'profileUrl',
  username: 'username',
  profileImageUrl: 'profileImageUrl'
};

**
 * An extension to ss.user.types.user for the currently logged
 * in user's data object. Contains keys that are only available to
 * the owner of this data object
 * @enum {string}
 *
ss.config.user.typeMappings.ownuser = {
  email: 'email',
  verified: 'verified'
};
*/
