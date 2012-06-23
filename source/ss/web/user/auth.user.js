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
 *
 *                                                                                                                              
 *                                                                                           
 *********                                                                                   
 * createdate 25/May/2011
 * 
 */

goog.provide('ss.web.user.auth');
goog.require('ss.Events');

// create the master auth events instance 
ss.web.user.auth.events = new ss.Events();

/**
 * The following events exist and can be listened to with:
 * ss.web.user.auth.events.addEventListener(eventName, [...])
 *
 * tw_click(elId) :: Click on a Twitter login button. elId is the ID of the html element
 *            that was clicked
 * fb_click(elId) :: Click on a Facebook login button. elId is the ID of the html element
 *            that was clicked
 * fb_click_reply(state) :: Facebook auth flow ended. state is boolean for auth state
 * logout_click(elId) :: Logout link clicked. elId is the ID of the html element that was clicked
 * 
 */