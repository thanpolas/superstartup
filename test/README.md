# Superstartup Tests

## Introduction
There are two kind of tests we perform for the superstartup library, behavioral and unit.

### Behavioral Tests
Behavioral tests examine the exposed API of the library and must be run both while developing the library but most importantly **after the library has been packaged and compiled** to ensure all public API calls behave as expected and the library's integrity is intact.

### Unit Tests
Unit tests will examine the innards of the library. Internally used components, helpers and tools are tested down to the smallest unit.

## How to run

### Run tests using Grunt

There are grunt tasks for running the tests. To better emulate running conditions all tests are run using phantomJS so there is a complete DOM environment.

* `grunt mochaPhantom` run the BDD tests in a minimal format.
* `grunt mochaPhantom` run the BDD tests using the full spec reporter.


### Run tests manually
To perform manual runs of the BDD tests the following command is required:

```shell
node_modules/mocha-phantomjs/bin/mocha-phantomjs [path-to-file].html -R [reporter]
```

Reporter can be `min` or `spec` or any other you prefer.

# Tests AutoDoc

   - [Core API :: ss()](#core-api--ss)
     - [ss()](#core-api--ss-ss)
     - [Invoke ss() and listen for all events and callbacks](#core-api--ss-invoke-ss-and-listen-for-all-events-and-callbacks)
       - [Executing ss() and follow up ready methods](#core-api--ss-invoke-ss-and-listen-for-all-events-and-callbacks-executing-ss-and-follow-up-ready-methods)
       - [The returned promise](#core-api--ss-invoke-ss-and-listen-for-all-events-and-callbacks-the-returned-promise)
       - [The init event](#core-api--ss-invoke-ss-and-listen-for-all-events-and-callbacks-the-init-event)
       - [The init callback](#core-api--ss-invoke-ss-and-listen-for-all-events-and-callbacks-the-init-callback)
       - [The initial auth state event](#core-api--ss-invoke-ss-and-listen-for-all-events-and-callbacks-the-initial-auth-state-event)
   - [Events API](#events-api)
   - [User Auth Module :: Core functionality](#user-auth-module--core-functionality)
     - [Auth / Deauth](#user-auth-module--core-functionality-auth--deauth)
     - [Read user data object](#user-auth-module--core-functionality-read-user-data-object)
     - [Core Auth Events](#user-auth-module--core-functionality-core-auth-events)
   - [User Auth Module :: Login](#user-auth-module--login)
     - [Basic login operation with Object Literal](#user-auth-module--login-basic-login-operation-with-object-literal)
       - [login operations](#user-auth-module--login-basic-login-operation-with-object-literal-login-operations)
       - [Basic login events](#user-auth-module--login-basic-login-operation-with-object-literal-basic-login-events)
         - [standard EVENTS](#user-auth-module--login-basic-login-operation-with-object-literal-basic-login-events-standard-events)
         - [Cancel operations from user.beforeLogin event, using "return false;"](#user-auth-module--login-basic-login-operation-with-object-literal-basic-login-events-cancel-operations-from-userbeforelogin-event-using-return-false)
         - [Cancel operations from user.beforeLogin event, using "preventDefault();"](#user-auth-module--login-basic-login-operation-with-object-literal-basic-login-events-cancel-operations-from-userbeforelogin-event-using-preventdefault)
         - [Advanced event operations](#user-auth-module--login-basic-login-operation-with-object-literal-basic-login-events-advanced-event-operations)
         - [Analyze the event object of the "user.afterLoginResponse" event](#user-auth-module--login-basic-login-operation-with-object-literal-basic-login-events-analyze-the-event-object-of-the-userafterloginresponse-event)
     - [Login from a DOM Form using jQuery](#user-auth-module--login-login-from-a-dom-form-using-jquery)
       - [login operations](#user-auth-module--login-login-from-a-dom-form-using-jquery-login-operations)
       - [Basic login events](#user-auth-module--login-login-from-a-dom-form-using-jquery-basic-login-events)
         - [standard EVENTS](#user-auth-module--login-login-from-a-dom-form-using-jquery-basic-login-events-standard-events)
         - [Cancel operations from user.beforeLogin event, using "return false;"](#user-auth-module--login-login-from-a-dom-form-using-jquery-basic-login-events-cancel-operations-from-userbeforelogin-event-using-return-false)
         - [Cancel operations from user.beforeLogin event, using "preventDefault();"](#user-auth-module--login-login-from-a-dom-form-using-jquery-basic-login-events-cancel-operations-from-userbeforelogin-event-using-preventdefault)
         - [Advanced event operations](#user-auth-module--login-login-from-a-dom-form-using-jquery-basic-login-events-advanced-event-operations)
         - [Analyze the event object of the "user.afterLoginResponse" event](#user-auth-module--login-login-from-a-dom-form-using-jquery-basic-login-events-analyze-the-event-object-of-the-userafterloginresponse-event)
     - [Login from a DOM Form using DOM Element](#user-auth-module--login-login-from-a-dom-form-using-dom-element)
       - [login operations](#user-auth-module--login-login-from-a-dom-form-using-dom-element-login-operations)
       - [Basic login events](#user-auth-module--login-login-from-a-dom-form-using-dom-element-basic-login-events)
         - [standard EVENTS](#user-auth-module--login-login-from-a-dom-form-using-dom-element-basic-login-events-standard-events)
         - [Cancel operations from user.beforeLogin event, using "return false;"](#user-auth-module--login-login-from-a-dom-form-using-dom-element-basic-login-events-cancel-operations-from-userbeforelogin-event-using-return-false)
         - [Cancel operations from user.beforeLogin event, using "preventDefault();"](#user-auth-module--login-login-from-a-dom-form-using-dom-element-basic-login-events-cancel-operations-from-userbeforelogin-event-using-preventdefault)
         - [Advanced event operations](#user-auth-module--login-login-from-a-dom-form-using-dom-element-basic-login-events-advanced-event-operations)
         - [Analyze the event object of the "user.afterLoginResponse" event](#user-auth-module--login-login-from-a-dom-form-using-dom-element-basic-login-events-analyze-the-event-object-of-the-userafterloginresponse-event)
   - [User Auth Module :: Logging out](#user-auth-module--logging-out)
   - [User Auth Module Plugins :: Facebook](#user-auth-module-plugins--facebook)
     - [Proper Interface implementation for facebook](#user-auth-module-plugins--facebook-proper-interface-implementation-for-facebook)
     - [Auth and deAuth methods for facebook](#user-auth-module-plugins--facebook-auth-and-deauth-methods-for-facebook)
       - [udo & auth / deAuth plugin tests](#user-auth-module-plugins--facebook-auth-and-deauth-methods-for-facebook-udo--auth--deauth-plugin-tests)
         - [Perform auth / deauth method tests for plugin](#user-auth-module-plugins--facebook-auth-and-deauth-methods-for-facebook-udo--auth--deauth-plugin-tests-perform-auth--deauth-method-tests-for-plugin)
     - [Login tests for plugin: facebook](#user-auth-module-plugins--facebook-login-tests-for-plugin-facebook)
       - [login callback tests](#user-auth-module-plugins--facebook-login-tests-for-plugin-facebook-login-callback-tests)
       - [utility methods](#user-auth-module-plugins--facebook-login-tests-for-plugin-facebook-utility-methods)
     - [Event tests for plugin: facebook](#user-auth-module-plugins--facebook-event-tests-for-plugin-facebook)
       - [Basic login events](#user-auth-module-plugins--facebook-event-tests-for-plugin-facebook-basic-login-events)
         - [standard EVENTS](#user-auth-module-plugins--facebook-event-tests-for-plugin-facebook-basic-login-events-standard-events)
         - [Cancel operations from user.beforeLogin event, using "return false;"](#user-auth-module-plugins--facebook-event-tests-for-plugin-facebook-basic-login-events-cancel-operations-from-userbeforelogin-event-using-return-false)
         - [Cancel operations from user.beforeLogin event, using "preventDefault();"](#user-auth-module-plugins--facebook-event-tests-for-plugin-facebook-basic-login-events-cancel-operations-from-userbeforelogin-event-using-preventdefault)
         - [Advanced event operations](#user-auth-module-plugins--facebook-event-tests-for-plugin-facebook-basic-login-events-advanced-event-operations)
         - [Analyze the event object of the "user.afterLoginResponse" event](#user-auth-module-plugins--facebook-event-tests-for-plugin-facebook-basic-login-events-analyze-the-event-object-of-the-userafterloginresponse-event)
       - [Events emitted during 3rd party login operation. Plugin: facebook](#user-auth-module-plugins--facebook-event-tests-for-plugin-facebook-events-emitted-during-3rd-party-login-operation-plugin-facebook)
       - [Stop authentication if false is returned on "user.extAuthChange" event. Plugin: facebook](#user-auth-module-plugins--facebook-event-tests-for-plugin-facebook-stop-authentication-if-false-is-returned-on-userextauthchange-event-plugin-facebook)
   - [User Auth Module Plugins :: Twitter](#user-auth-module-plugins--twitter)
     - [Proper Interface implementation for twitter](#user-auth-module-plugins--twitter-proper-interface-implementation-for-twitter)
     - [Auth and deAuth methods for twitter](#user-auth-module-plugins--twitter-auth-and-deauth-methods-for-twitter)
       - [udo & auth / deAuth plugin tests](#user-auth-module-plugins--twitter-auth-and-deauth-methods-for-twitter-udo--auth--deauth-plugin-tests)
         - [Perform auth / deauth method tests for plugin](#user-auth-module-plugins--twitter-auth-and-deauth-methods-for-twitter-udo--auth--deauth-plugin-tests-perform-auth--deauth-method-tests-for-plugin)
     - [Login tests for plugin: twitter](#user-auth-module-plugins--twitter-login-tests-for-plugin-twitter)
       - [login callback tests](#user-auth-module-plugins--twitter-login-tests-for-plugin-twitter-login-callback-tests)
       - [utility methods](#user-auth-module-plugins--twitter-login-tests-for-plugin-twitter-utility-methods)
     - [Event tests for plugin: twitter](#user-auth-module-plugins--twitter-event-tests-for-plugin-twitter)
       - [Basic login events](#user-auth-module-plugins--twitter-event-tests-for-plugin-twitter-basic-login-events)
         - [standard EVENTS](#user-auth-module-plugins--twitter-event-tests-for-plugin-twitter-basic-login-events-standard-events)
       - [Events emitted during 3rd party login operation. Plugin: twitter](#user-auth-module-plugins--twitter-event-tests-for-plugin-twitter-events-emitted-during-3rd-party-login-operation-plugin-twitter)
       - [Stop authentication if false is returned on "user.extAuthChange" event. Plugin: twitter](#user-auth-module-plugins--twitter-event-tests-for-plugin-twitter-stop-authentication-if-false-is-returned-on-userextauthchange-event-plugin-twitter)



# Core API :: ss()

## ss()
should be a function.

```js
expect( ss ).to.be.a('function');
```

should have a listen method.

```js
expect( ss.listen ).to.be.a('function');
```

should have an init method.

```js
expect( ss.init ).to.be.a('function');
```

should have an isReady method.

```js
expect( ss.isReady ).to.be.a('function');
```

should report a ready state of false.

```js
expect( ss.isReady() ).to.be.false;
```


## Invoke ss() and listen for all events and callbacks

### Executing ss() and follow up ready methods
should boot up the app and emit an init event.

```js
ss.listen(ssd.test.fixture.event.core.INIT, initCb);
ss.listen(ssd.test.fixture.event.user.INITIAL_AUTH_STATE, authChangeCb);

ss.config('user.fb.appId', '123');

ssReturn = ss( ssCallback );

expect( ssReturn.always ).to.be.a('function');

window.fbAsyncInit();

ssReturn.always(ss.removeAllListeners).always(function() {
  done();
});
```

should have not made any sync calls.

```js
expect( stubSync.called ).to.be.false;
stubSync.restore();
```

should report a ready state of true.

```js
expect( ss.isReady() ).to.be.true;
```

should accept a callback that immediately invokes.

```js
var spy = sinon.spy();
ss( spy );
expect( spy.calledOnce ).to.be.true;
```


### The returned promise
should have a then method.

```js
expect( ssReturn.then ).to.be.a('function');
```

should have an otherwise method.

```js
expect( ssReturn.otherwise ).to.be.a('function');
```

should have a yield method.

```js
expect( ssReturn.yield ).to.be.a('function');
```

should have a spread method.

```js
expect( ssReturn.spread ).to.be.a('function');
```

should immediately invoke fullfilled using then.

```js
var onFulfilled = sinon.spy(),
    onRejected = sinon.spy();
ssReturn.then( onFulfilled, onRejected );
expect( onFulfilled.calledOnce ).to.be.true;
```

should not invoke rejected using then.

```js
var onFulfilled = sinon.spy(),
    onRejected = sinon.spy();
ssReturn.then( onFulfilled, onRejected );
expect( onRejected.called ).to.be.false;
```


### The init event
should have triggered the init event.

```js
expect( initCb.calledOnce ).to.be.true;
```


### The init callback
should have triggered the init callback.

```js
expect( ssCallback.calledOnce ).to.be.true;
```


### The initial auth state event
should have triggered the initial auth state event.

```js
expect( authChangeCb.calledOnce ).to.be.true;
```

should have the authState property.

```js
expect( authChangeCb.calledOnce ).to.be.true;
var ev = authChangeCb.getCall(0).args[0];
expect( ev.authState ).to.be.a('boolean');
expect( ev.authState ).to.be.false;
```


# Events API
should listen and trigger arbitrary events.

```js
function cb () {
  done();
}
ss.listen('custom.event', cb);
ss.trigger('custom.event');
```

should cancel execution if listener executes preventDefault.

```js
function cb (eventObj) {
  eventObj.preventDefault();
}
ss.listen('custom.event', cb);
expect(ss.trigger('custom.event')).to.be.false;
done();
```

should cancel execution if listener returns false.

```js
function cb (eventObj) {
  return false;
}
ss.listen('custom.event', cb);
expect(ss.trigger('custom.event')).to.be.false;
done();
```

should allow for binding of selfObj.

```js
var obj = {
  a: 1
};
function cb (eventObj) {
  expect(this.a).to.be.equal(1);
  done();
}
ss.listen('custom.eventTwo', cb, obj);
ss.trigger('custom.eventTwo');
```

should pass parameters from trigger.

```js
function cb (eventObj) {
  expect(eventObj.arg1).to.be.equal(1);
  expect(eventObj.arg2).to.be.equal(2);
  done();
}
ss.listen('custom.eventThree', cb);
var eventObj = {
  type: 'custom.eventThree',
  arg1: 1,
  arg2: 2
};
ss.trigger(eventObj);
```

should remove listeners.

```js
var cid = ss.listen('custom.eventFour', function(){
  // should never be here
  expect(false).to.be.true;
});

ss.unlisten(cid);
ss.trigger('custom.eventFour');
expect(true).to.be.true;
```

should remove all listeners.

```js
function cb () {
  // should never be here
  expect(false).to.be.true;
}

ss.listen('custom.eventFive', cb);
ss.listen('custom.eventFive', cb);
ss.listen('custom.eventSix', cb);
ss.listen('custom.eventSeven', cb);

var n = ss.removeAllListeners();
ss.trigger('custom.eventFive');
expect(true).to.be.true;
```


# User Auth Module :: Core functionality

## Auth / Deauth
should not be authed (root alias).

```js
expect( ss.isAuthed() ).to.be.false;
```

should not be authed (user method).

```js
expect( ss.user.isAuthed() ).to.be.false;
```

should authenticate with a provided UDO.

```js
expect( ss.isAuthed() ).to.be.false;

      ss.user.auth( userFix );

      expect( ss.isAuthed() ).to.be.true;
```

should deauthenticate.

```js
expect( ss.isAuthed() ).to.be.true;
ss.user.deAuth();
expect(ss.isAuthed()).to.be.false;
```


## Read user data object
should provide the UDO with fancy GetSet.

```js
// start read tests, first the fancy read
expect( ss.user('id') ).to.equal(userFix.id);
expect( ss.user('firstName') ).to.equal(userFix.firstName);
expect( ss.user('bio') ).to.equal(userFix.bio);
```

should provide the UDO with get method.

```js
// now read using the 'get' method
expect(ss.user.get('id')).to.equal(userFix.id);
expect(ss.user.get('firstName')).to.equal(userFix.firstName);
expect(ss.user.get('bio')).to.equal(userFix.bio);
```

should provide the complete UDO with no args on fancy GetSet.

```js
// And finally by the raw output
expect(ss.user().id).to.equal(userFix.id);
expect(ss.user().firstName).to.equal(userFix.firstName);
expect(ss.user().bio).to.equal(userFix.bio);
```


## Core Auth Events
should trigger the AUTH_CHANGE event synchronously.

```js
var spy = sinon.spy();
var cid = ss.listen(event.user.AUTH_CHANGE, spy);
ss.user.auth( userFix );
expect( spy.calledOnce ).to.be.true;
ss.unlisten(cid);
```

should have authState when AUTH_CHANGE triggers.

```js
var spy = sinon.spy();
var cid = ss.listen(event.user.AUTH_CHANGE, spy);
ss.user.auth( userFix );
expect( spy.getCall(0).args[0].authState ).to.be.true;
ss.unlisten(cid);
```


# User Auth Module :: Login

## Basic login operation with Object Literal

### login operations
should call ssd.ajax once.

```js
ss.user.login( $element );
expect( stub.calledOnce ).to.be.true;
```

should login with provided argument.

```js
ss.user.login( $element );
expect( ss.isAuthed() ).to.be.true;
```

login passes expected name/value pairs .

```js
ss.user.login( $element );
expect( stub.getCall( 0 ).args[3] ).to.deep.equal( userLoginData );
```

should have a callback.

```js
var spy = sinon.spy();
ss.user.login( $element, spy);
expect( spy.calledOnce ).to.be.true;
```

should have a callback with err null.

```js
var spy = sinon.spy();
ss.user.login( $element, spy);
// err, authState, udo, response
var args = spy.getCall(0).args;
// err
expect( args[0] ).to.be.null;
```

should have a callback with authState.

```js
var spy = sinon.spy();
ss.user.login( $element, spy);
// err, authState, udo, response
var args = spy.getCall(0).args;
// authState
expect( args[1] ).to.be.true;
```

should have a callback with the UDO.

```js
var spy = sinon.spy();
ss.user.login( $element, spy);
// err, authState, udo, response
var args = spy.getCall(0).args;
// udo
expect( args[2] ).to.deep.equal( userFix );
```

should provide the data to be sent when the BEFORE_LOGIN event triggers.

```js
ss.listen( userEvent.BEFORE_LOGIN, function( eventObj ){
  expect( stub.called ).to.be.false;
  expect( eventObj.data ).to.deep.equal( userLoginData );
  done();
});

ss.user.login( $element, function(){
  expect( ss.isAuthed() ).to.be.true;
});
```


### Basic login events

#### standard EVENTS
should be authed.

```js
expect( ss.isAuthed() ).to.be.true;
```

should trigger the "user.authChange" event.

```js
expect( spyAuthChange.calledOnce ).to.be.true;
```

should have an authState and be true when triggering the "user.authChange" event.

```js
expect( spyAuthChange.getCall(0).args[0].authState ).to.be.true;
```

should trigger the "user.beforeLogin" event.

```js
expect( spyBeforeLocal.calledOnce ).to.be.true;
```

should emit the "user.onLoginResponse" event..

```js
expect( spyBeforeResponse.calledOnce ).to.be.true;
```

should emit the "user.afterLoginResponse" event..

```js
expect( spyAuthResponse.calledOnce   ).to.be.true;
```


#### Cancel operations from user.beforeLogin event, using "return false;"
should not be authed.

```js
expect( ss.isAuthed() ).to.be.false;
```

should not call sync.

```js
expect( stubNet.called ).to.be.false;
```

should have the err defined in the callback.

```js
expect( cbArgs[0] ).to.be.a('string');
```

callback arg "authState" should be false.

```js
expect( cbArgs[1] ).to.be.false;
```


#### Cancel operations from user.beforeLogin event, using "preventDefault();"
should not be authed.

```js
expect( ss.isAuthed() ).to.be.false;
```

should not call sync.

```js
expect( stubNet.called ).to.be.false;
```

should have the err defined in the callback.

```js
expect( cbArgs[0] ).to.be.a('string');
```

callback arg "authState" should be false.

```js
expect( cbArgs[1] ).to.be.false;
```


#### Advanced event operations
should be able to change data sent to the server when "user.beforeLogin" triggers.

```js
var funnyData = {
          one: 1,
          cow: 'cow',
          gangnam: ['style', 42]
        };
        ss.listen( userEvent.BEFORE_LOGIN, function( eventObj ){
          eventObj.backPipe(function(data) {
            return funnyData;
          });
        });

        loginTrigger( function( err, authState, user, response ){
          expect( stubNet.getCall( 0 ).args[3] ).to.deep.equal( funnyData );
          done();
        });
```

should trigger the "user.onLoginResponse" event.

```js
ss.listen( userEvent.ON_LOGIN_RESPONSE, function( eventObj ){
  expect( stubNet.calledOnce ).to.be.true;
  expect( ss.isAuthed() ).to.be.false;
  done();
});
loginTrigger();
```

should prevent login if we return false at the "user.onLoginResponse" event.

```js
ss.listen( userEvent.ON_LOGIN_RESPONSE, function( eventObj ){
  return false;
});
loginTrigger( function( err, authState, user, response ){
  expect( stubNet.calledOnce ).to.be.true;
  expect( ss.isAuthed() ).to.be.false;
  expect( authState ).to.be.false;

  expect( err ).to.be.a('string');
  done();
});
```

should trigger the AFTER_LOGIN_RESPONSE event.

```js
var spy = sinon.spy();
ss.listen( userEvent.AFTER_LOGIN_RESPONSE, spy);
loginTrigger();
expect( spy.calledOnce ).to.be.true;
```


#### Analyze the event object of the "user.afterLoginResponse" event
should have an "authState" key, boolean.

```js
expect( eventObj.authState ).to.be.a('boolean');
```

should have an "authState" key, false.

```js
expect( eventObj.authState ).to.be.false;
```

should have a "success" key, boolean, true.

```js
expect( eventObj.success ).to.be.a('boolean');
expect( eventObj.success ).to.be.true;
```

should have an "errorMessage" key, null.

```js
expect( eventObj.errorMessage ).to.be.null;
```

should have a "httpStatus" key, number, 200.

```js
expect( eventObj.httpStatus ).to.be.a('number');
expect( eventObj.httpStatus ).to.equal(200);
```

should have a "responseRaw" key, string.

```js
expect( eventObj.responseRaw ).to.be.a('string');
```

should have a "responseRaw" key with the proper value.

```js
expect( eventObj.responseRaw ).to.equal( JSON.stringify(userFix) );
```

should have a "udo" key, object.

```js
expect( eventObj.udo ).to.be.an('object');
```

should have a "udo" key deep equal to the udo fixture.

```js
expect( eventObj.udo ).to.deep.equal( userFix );
```


## Login from a DOM Form using jQuery

### login operations
should call ssd.ajax once.

```js
ss.user.login( $element );
expect( stub.calledOnce ).to.be.true;
```

should login with provided argument.

```js
ss.user.login( $element );
expect( ss.isAuthed() ).to.be.true;
```

login passes expected name/value pairs .

```js
ss.user.login( $element );
expect( stub.getCall( 0 ).args[3] ).to.deep.equal( userLoginData );
```

should have a callback.

```js
var spy = sinon.spy();
ss.user.login( $element, spy);
expect( spy.calledOnce ).to.be.true;
```

should have a callback with err null.

```js
var spy = sinon.spy();
ss.user.login( $element, spy);
// err, authState, udo, response
var args = spy.getCall(0).args;
// err
expect( args[0] ).to.be.null;
```

should have a callback with authState.

```js
var spy = sinon.spy();
ss.user.login( $element, spy);
// err, authState, udo, response
var args = spy.getCall(0).args;
// authState
expect( args[1] ).to.be.true;
```

should have a callback with the UDO.

```js
var spy = sinon.spy();
ss.user.login( $element, spy);
// err, authState, udo, response
var args = spy.getCall(0).args;
// udo
expect( args[2] ).to.deep.equal( userFix );
```

should provide the data to be sent when the BEFORE_LOGIN event triggers.

```js
ss.listen( userEvent.BEFORE_LOGIN, function( eventObj ){
  expect( stub.called ).to.be.false;
  expect( eventObj.data ).to.deep.equal( userLoginData );
  done();
});

ss.user.login( $element, function(){
  expect( ss.isAuthed() ).to.be.true;
});
```


### Basic login events

#### standard EVENTS
should be authed.

```js
expect( ss.isAuthed() ).to.be.true;
```

should trigger the "user.authChange" event.

```js
expect( spyAuthChange.calledOnce ).to.be.true;
```

should have an authState and be true when triggering the "user.authChange" event.

```js
expect( spyAuthChange.getCall(0).args[0].authState ).to.be.true;
```

should trigger the "user.beforeLogin" event.

```js
expect( spyBeforeLocal.calledOnce ).to.be.true;
```

should emit the "user.onLoginResponse" event..

```js
expect( spyBeforeResponse.calledOnce ).to.be.true;
```

should emit the "user.afterLoginResponse" event..

```js
expect( spyAuthResponse.calledOnce   ).to.be.true;
```


#### Cancel operations from user.beforeLogin event, using "return false;"
should not be authed.

```js
expect( ss.isAuthed() ).to.be.false;
```

should not call sync.

```js
expect( stubNet.called ).to.be.false;
```

should have the err defined in the callback.

```js
expect( cbArgs[0] ).to.be.a('string');
```

callback arg "authState" should be false.

```js
expect( cbArgs[1] ).to.be.false;
```


#### Cancel operations from user.beforeLogin event, using "preventDefault();"
should not be authed.

```js
expect( ss.isAuthed() ).to.be.false;
```

should not call sync.

```js
expect( stubNet.called ).to.be.false;
```

should have the err defined in the callback.

```js
expect( cbArgs[0] ).to.be.a('string');
```

callback arg "authState" should be false.

```js
expect( cbArgs[1] ).to.be.false;
```


#### Advanced event operations
should be able to change data sent to the server when "user.beforeLogin" triggers.

```js
var funnyData = {
          one: 1,
          cow: 'cow',
          gangnam: ['style', 42]
        };
        ss.listen( userEvent.BEFORE_LOGIN, function( eventObj ){
          eventObj.backPipe(function(data) {
            return funnyData;
          });
        });

        loginTrigger( function( err, authState, user, response ){
          expect( stubNet.getCall( 0 ).args[3] ).to.deep.equal( funnyData );
          done();
        });
```

should trigger the "user.onLoginResponse" event.

```js
ss.listen( userEvent.ON_LOGIN_RESPONSE, function( eventObj ){
  expect( stubNet.calledOnce ).to.be.true;
  expect( ss.isAuthed() ).to.be.false;
  done();
});
loginTrigger();
```

should prevent login if we return false at the "user.onLoginResponse" event.

```js
ss.listen( userEvent.ON_LOGIN_RESPONSE, function( eventObj ){
  return false;
});
loginTrigger( function( err, authState, user, response ){
  expect( stubNet.calledOnce ).to.be.true;
  expect( ss.isAuthed() ).to.be.false;
  expect( authState ).to.be.false;

  expect( err ).to.be.a('string');
  done();
});
```

should trigger the AFTER_LOGIN_RESPONSE event.

```js
var spy = sinon.spy();
ss.listen( userEvent.AFTER_LOGIN_RESPONSE, spy);
loginTrigger();
expect( spy.calledOnce ).to.be.true;
```


#### Analyze the event object of the "user.afterLoginResponse" event
should have an "authState" key, boolean.

```js
expect( eventObj.authState ).to.be.a('boolean');
```

should have an "authState" key, false.

```js
expect( eventObj.authState ).to.be.false;
```

should have a "success" key, boolean, true.

```js
expect( eventObj.success ).to.be.a('boolean');
expect( eventObj.success ).to.be.true;
```

should have an "errorMessage" key, null.

```js
expect( eventObj.errorMessage ).to.be.null;
```

should have a "httpStatus" key, number, 200.

```js
expect( eventObj.httpStatus ).to.be.a('number');
expect( eventObj.httpStatus ).to.equal(200);
```

should have a "responseRaw" key, string.

```js
expect( eventObj.responseRaw ).to.be.a('string');
```

should have a "responseRaw" key with the proper value.

```js
expect( eventObj.responseRaw ).to.equal( JSON.stringify(userFix) );
```

should have a "udo" key, object.

```js
expect( eventObj.udo ).to.be.an('object');
```

should have a "udo" key deep equal to the udo fixture.

```js
expect( eventObj.udo ).to.deep.equal( userFix );
```


## Login from a DOM Form using DOM Element

### login operations
should call ssd.ajax once.

```js
ss.user.login( $element );
expect( stub.calledOnce ).to.be.true;
```

should login with provided argument.

```js
ss.user.login( $element );
expect( ss.isAuthed() ).to.be.true;
```

login passes expected name/value pairs .

```js
ss.user.login( $element );
expect( stub.getCall( 0 ).args[3] ).to.deep.equal( userLoginData );
```

should have a callback.

```js
var spy = sinon.spy();
ss.user.login( $element, spy);
expect( spy.calledOnce ).to.be.true;
```

should have a callback with err null.

```js
var spy = sinon.spy();
ss.user.login( $element, spy);
// err, authState, udo, response
var args = spy.getCall(0).args;
// err
expect( args[0] ).to.be.null;
```

should have a callback with authState.

```js
var spy = sinon.spy();
ss.user.login( $element, spy);
// err, authState, udo, response
var args = spy.getCall(0).args;
// authState
expect( args[1] ).to.be.true;
```

should have a callback with the UDO.

```js
var spy = sinon.spy();
ss.user.login( $element, spy);
// err, authState, udo, response
var args = spy.getCall(0).args;
// udo
expect( args[2] ).to.deep.equal( userFix );
```

should provide the data to be sent when the BEFORE_LOGIN event triggers.

```js
ss.listen( userEvent.BEFORE_LOGIN, function( eventObj ){
  expect( stub.called ).to.be.false;
  expect( eventObj.data ).to.deep.equal( userLoginData );
  done();
});

ss.user.login( $element, function(){
  expect( ss.isAuthed() ).to.be.true;
});
```


### Basic login events

#### standard EVENTS
should be authed.

```js
expect( ss.isAuthed() ).to.be.true;
```

should trigger the "user.authChange" event.

```js
expect( spyAuthChange.calledOnce ).to.be.true;
```

should have an authState and be true when triggering the "user.authChange" event.

```js
expect( spyAuthChange.getCall(0).args[0].authState ).to.be.true;
```

should trigger the "user.beforeLogin" event.

```js
expect( spyBeforeLocal.calledOnce ).to.be.true;
```

should emit the "user.onLoginResponse" event..

```js
expect( spyBeforeResponse.calledOnce ).to.be.true;
```

should emit the "user.afterLoginResponse" event..

```js
expect( spyAuthResponse.calledOnce   ).to.be.true;
```


#### Cancel operations from user.beforeLogin event, using "return false;"
should not be authed.

```js
expect( ss.isAuthed() ).to.be.false;
```

should not call sync.

```js
expect( stubNet.called ).to.be.false;
```

should have the err defined in the callback.

```js
expect( cbArgs[0] ).to.be.a('string');
```

callback arg "authState" should be false.

```js
expect( cbArgs[1] ).to.be.false;
```


#### Cancel operations from user.beforeLogin event, using "preventDefault();"
should not be authed.

```js
expect( ss.isAuthed() ).to.be.false;
```

should not call sync.

```js
expect( stubNet.called ).to.be.false;
```

should have the err defined in the callback.

```js
expect( cbArgs[0] ).to.be.a('string');
```

callback arg "authState" should be false.

```js
expect( cbArgs[1] ).to.be.false;
```


#### Advanced event operations
should be able to change data sent to the server when "user.beforeLogin" triggers.

```js
var funnyData = {
          one: 1,
          cow: 'cow',
          gangnam: ['style', 42]
        };
        ss.listen( userEvent.BEFORE_LOGIN, function( eventObj ){
          eventObj.backPipe(function(data) {
            return funnyData;
          });
        });

        loginTrigger( function( err, authState, user, response ){
          expect( stubNet.getCall( 0 ).args[3] ).to.deep.equal( funnyData );
          done();
        });
```

should trigger the "user.onLoginResponse" event.

```js
ss.listen( userEvent.ON_LOGIN_RESPONSE, function( eventObj ){
  expect( stubNet.calledOnce ).to.be.true;
  expect( ss.isAuthed() ).to.be.false;
  done();
});
loginTrigger();
```

should prevent login if we return false at the "user.onLoginResponse" event.

```js
ss.listen( userEvent.ON_LOGIN_RESPONSE, function( eventObj ){
  return false;
});
loginTrigger( function( err, authState, user, response ){
  expect( stubNet.calledOnce ).to.be.true;
  expect( ss.isAuthed() ).to.be.false;
  expect( authState ).to.be.false;

  expect( err ).to.be.a('string');
  done();
});
```

should trigger the AFTER_LOGIN_RESPONSE event.

```js
var spy = sinon.spy();
ss.listen( userEvent.AFTER_LOGIN_RESPONSE, spy);
loginTrigger();
expect( spy.calledOnce ).to.be.true;
```


#### Analyze the event object of the "user.afterLoginResponse" event
should have an "authState" key, boolean.

```js
expect( eventObj.authState ).to.be.a('boolean');
```

should have an "authState" key, false.

```js
expect( eventObj.authState ).to.be.false;
```

should have a "success" key, boolean, true.

```js
expect( eventObj.success ).to.be.a('boolean');
expect( eventObj.success ).to.be.true;
```

should have an "errorMessage" key, null.

```js
expect( eventObj.errorMessage ).to.be.null;
```

should have a "httpStatus" key, number, 200.

```js
expect( eventObj.httpStatus ).to.be.a('number');
expect( eventObj.httpStatus ).to.equal(200);
```

should have a "responseRaw" key, string.

```js
expect( eventObj.responseRaw ).to.be.a('string');
```

should have a "responseRaw" key with the proper value.

```js
expect( eventObj.responseRaw ).to.equal( JSON.stringify(userFix) );
```

should have a "udo" key, object.

```js
expect( eventObj.udo ).to.be.an('object');
```

should have a "udo" key deep equal to the udo fixture.

```js
expect( eventObj.udo ).to.deep.equal( userFix );
```


# User Auth Module :: Logging out
should be authenticated when starting a logout test.

```js
expect( ss.isAuthed() ).to.be.true;
```

should perform an xhr request on logout.

```js
ss.user.logout();
expect(stub.calledOnce).to.be.true;
```

should deauth on logout.

```js
ss.user.logout();
expect(stub.calledOnce).to.be.true;
expect(ss.isAuthed()).to.be.false;
```

should leave no traces of data when logging out.

```js
expect(ss.user('id')).to.equal(userFix.id);
ss.user.logout();
expect(ss.isAuthed()).to.be.false;
expect(ss.user('id')).to.not.exist;
```

should have a callback when logging out.

```js
var spy = sinon.spy();
ss.user.logout(spy);
expect( spy.calledOnce ).to.be.true;
```

should not be authed inside the callback.

```js
ss.user.logout(function(err, success){
  expect(ss.isAuthed()).to.be.false;
  done();
});
```

the callback should have two arguments.

```js
var spy = sinon.spy();
ss.user.logout(spy);
var args = spy.getCall(0).args;
expect( args.length ).to.equal(2);
```

callback first arg is the err and should be null.

```js
var spy = sinon.spy();
ss.user.logout(spy);
var args = spy.getCall(0).args;
expect( args[0] ).to.be.null;
```

callback second arg is the success and should be true.

```js
var spy = sinon.spy();
ss.user.logout(spy);
var args = spy.getCall(0).args;
expect( args[1] ).to.be.a('boolean');
expect( args[1] ).to.be.true;
```

should trigger the AUTH_CHANGE event.

```js
var spy = sinon.spy();
ss.listen(userEvent.AUTH_CHANGE, spy);
ss.user.logout();
expect( spy.calledOnce ).to.be.true;
```

should trigger the BEFORE_LOGOUT event.

```js
var spy = sinon.spy();
ss.listen(userEvent.BEFORE_LOGOUT, spy);
ss.user.logout();
expect( spy.calledOnce ).to.be.true;
```

should trigger the ON_LOGOUT_RESPONSE event.

```js
var spy = sinon.spy();
ss.listen(userEvent.ON_LOGOUT_RESPONSE, spy);
ss.user.logout();
expect( spy.calledOnce ).to.be.true;
```

should trigger the AFTER_LOGOUT_RESPONSE event.

```js
var spy = sinon.spy();
ss.listen(userEvent.AFTER_LOGOUT_RESPONSE, spy);
ss.user.logout();
expect( spy.calledOnce ).to.be.true;
```

should trigger events in the right order.

```js
var spyBeforeLogout =        sinon.spy(),
    spyAuthChange =          sinon.spy(),
    spyOnLogoutResponse =    sinon.spy(),
    spyAfterLogoutResponse = sinon.spy();

ss.listen(userEvent.BEFORE_LOGOUT, spyBeforeLogout);
ss.listen(userEvent.AUTH_CHANGE, spyAuthChange);
ss.listen(userEvent.ON_LOGOUT_RESPONSE, spyOnLogoutResponse);
ss.listen(userEvent.AFTER_LOGOUT_RESPONSE, spyAfterLogoutResponse);

ss.user.logout();

expect( spyBeforeLogout.calledBefore( spyAuthChange )).to.be.true;
expect( spyAuthChange.calledBefore( spyOnLogoutResponse )).to.be.true;
expect( spyOnLogoutResponse.calledBefore( spyAfterLogoutResponse )).to.be.true;
```

should trigger the AUTH_CHANGE event and provide authState key.

```js
ss.listen(userEvent.AUTH_CHANGE, function(eventObj){
  expect( eventObj.authState ).to.be.false;
  done();
});
ss.user.logout();
```

should trigger the AUTH_CHANGE event and not be authed.

```js
ss.listen(userEvent.AUTH_CHANGE, function(eventObj){
  expect(ss.isAuthed()).to.be.false;
  done();
});
ss.user.logout();
```

should cancel logout if we return false at the BEFORE_LOGOUT event.

```js
ss.listen(userEvent.BEFORE_LOGOUT, function(eventObj){
  return false;
});
ss.user.logout();
expect(stub.called).to.be.false;
expect(ss.isAuthed()).to.be.true;
```


# User Auth Module Plugins :: Facebook

## Proper Interface implementation for facebook
should have a getSourceId() method.

```js
expect( plugin.getSourceId ).to.be.a('function');
```

getSourceId() should return the plugin name.

```js
expect( plugin.getSourceId() ).to.equal( _this.pluginName );
```

should have a login() method.

```js
expect( plugin.login ).to.be.a('function');
```

should have a hasJSAPI() method which returns boolean.

```js
expect( plugin.hasJSAPI() ).to.be.a.boolean;
```

should have a logout() method.

```js
expect( plugin.logout ).to.be.a('function');
```

should have an isAuthed() method and return boolean.

```js
expect( plugin.isAuthed ).to.be.a('function');
expect( plugin.isAuthed() ).to.be.a('boolean');
```

should have a getUdo() method.

```js
expect( plugin.getUdo ).to.be.a('function');
```

getUdo() should return null when not authed with the plugin.

```js
var spy = sinon.spy();
plugin.getUdo(spy);
expect( spy.getCall(0).args[0] ).to.be.a('null');
```

should have a getAccessToken() method.

```js
expect( plugin.getAccessToken ).to.be.a('function');
```

getAccessToken() should always return null.

```js
expect( plugin.getAccessToken() ).to.be.null;
```

should have a logout method.

```js
expect( plugin.logout ).to.be.a('function');
```


## Auth and deAuth methods for facebook

### udo & auth / deAuth plugin tests

#### Perform auth / deauth method tests for plugin
should not be authed.

```js
expect( ss.isAuthed() ).to.be.false;
```

should have an auth method.

```js
expect( _this.plugin.auth ).to.be.a('function');
```

should have a deAuth method.

```js
expect( _this.plugin.deAuth ).to.be.a('function');
```

should authenticate globaly.

```js
_this.plugin.auth();
expect( ss.isAuthed() ).to.be.true;
```

should de-authenticate globaly.

```js
_this.plugin.deAuth();
expect( ss.isAuthed() ).to.be.false;
```


## Login tests for plugin: facebook

### login callback tests
should have a callback.

```js
expect(spyCB.calledOnce).to.be.true;
```

should have a callback with 5 arguments.

```js
expect( spyCB.args[0].length ).to.equal(5);
```

should have a callback with arg1, the error message, null.

```js
expect( spyCB.args[0][0] ).to.be.null;
```

should have a callback with arg2, authState, boolean.

```js
expect( spyCB.args[0][1] ).to.be.a('boolean');
```

should have a callback with arg3, udo, object.

```js
expect( spyCB.args[0][2] ).to.be.an('object');
```

should have a callback with arg4, server response raw, object.

```js
expect( spyCB.args[0][3] ).to.be.an(_this.loginCbArg4Type);
```

should have a callback with arg5, third-party response raw, object.

```js
expect( spyCB.args[0][4] ).to.be.an(_this.loginCbArg5Type);
```

should have a proper user data object provided on the callback.

```js
expect( spyCB.getCall(0).args[2] ).to.deep.equal(fixtures.userOne);
```

should have a proper server response data object provided on the callback.

```js
expect( spyCB.getCall(0).args[3] ).to.deep.equal(fixtures.userOne);
```

should have a proper 3rd party response data object provided on the callback.

```js
expect( spyCB.getCall(0).args[4] ).to.deep.equal(_this.pluginResponse);
```


### utility methods
should return true when asked if hasJSAPI().

```js
expect( plugin.hasJSAPI() ).to.equal(_this.hasJSAPI);
```

should verify with local server.

```js
plugin.login();
expect( stubNet.calledOnce === plugin.hasLocalAuth() ).to.be.true;
```

should globally authenticate us.

```js
plugin.login();
expect( ss.isAuthed() ).to.be.true;
```

should exist in the authedSources() returning array.

```js
plugin.login();
expect( ss.user.authedSources() ).to.include(_this.pluginName);
```

should return the UDO as provided by the plugin.

```js
plugin.login();
var spy = sinon.spy();
plugin.getUdo( spy );
expect( spy.getCall(0).args[0] ).to.deep.equal(_this.pluginUDO);
```

should return the Access Token of the plugin.

```js
plugin.login();
expect( plugin.getAccessToken() ).to.equal(
  _this.accessToken);
```


## Event tests for plugin: facebook

### Basic login events

#### standard EVENTS
should be authed.

```js
expect( ss.isAuthed() ).to.be.true;
```

should trigger the "user.authChange" event.

```js
expect( spyAuthChange.calledOnce ).to.be.true;
```

should have an authState and be true when triggering the "user.authChange" event.

```js
expect( spyAuthChange.getCall(0).args[0].authState ).to.be.true;
```

should trigger the "user.beforeLogin" event.

```js
expect( spyBeforeLocal.calledOnce ).to.be.true;
```

should emit the "user.onLoginResponse" event..

```js
expect( spyBeforeResponse.calledOnce ).to.be.true;
```

should emit the "user.afterLoginResponse" event..

```js
expect( spyAuthResponse.calledOnce   ).to.be.true;
```


#### Cancel operations from user.beforeLogin event, using "return false;"
should not be authed.

```js
expect( ss.isAuthed() ).to.be.false;
```

should not call sync.

```js
expect( stubNet.called ).to.be.false;
```

should have the err defined in the callback.

```js
expect( cbArgs[0] ).to.be.a('string');
```

callback arg "authState" should be false.

```js
expect( cbArgs[1] ).to.be.false;
```


#### Cancel operations from user.beforeLogin event, using "preventDefault();"
should not be authed.

```js
expect( ss.isAuthed() ).to.be.false;
```

should not call sync.

```js
expect( stubNet.called ).to.be.false;
```

should have the err defined in the callback.

```js
expect( cbArgs[0] ).to.be.a('string');
```

callback arg "authState" should be false.

```js
expect( cbArgs[1] ).to.be.false;
```


#### Advanced event operations
should be able to change data sent to the server when "user.beforeLogin" triggers.

```js
var funnyData = {
          one: 1,
          cow: 'cow',
          gangnam: ['style', 42]
        };
        ss.listen( userEvent.BEFORE_LOGIN, function( eventObj ){
          eventObj.backPipe(function(data) {
            return funnyData;
          });
        });

        loginTrigger( function( err, authState, user, response ){
          expect( stubNet.getCall( 0 ).args[3] ).to.deep.equal( funnyData );
          done();
        });
```

should trigger the "user.onLoginResponse" event.

```js
ss.listen( userEvent.ON_LOGIN_RESPONSE, function( eventObj ){
  expect( stubNet.calledOnce ).to.be.true;
  expect( ss.isAuthed() ).to.be.false;
  done();
});
loginTrigger();
```

should prevent login if we return false at the "user.onLoginResponse" event.

```js
ss.listen( userEvent.ON_LOGIN_RESPONSE, function( eventObj ){
  return false;
});
loginTrigger( function( err, authState, user, response ){
  expect( stubNet.calledOnce ).to.be.true;
  expect( ss.isAuthed() ).to.be.false;
  expect( authState ).to.be.false;

  expect( err ).to.be.a('string');
  done();
});
```

should trigger the AFTER_LOGIN_RESPONSE event.

```js
var spy = sinon.spy();
ss.listen( userEvent.AFTER_LOGIN_RESPONSE, spy);
loginTrigger();
expect( spy.calledOnce ).to.be.true;
```


#### Analyze the event object of the "user.afterLoginResponse" event
should have an "authState" key, boolean.

```js
expect( eventObj.authState ).to.be.a('boolean');
```

should have an "authState" key, false.

```js
expect( eventObj.authState ).to.be.false;
```

should have a "success" key, boolean, true.

```js
expect( eventObj.success ).to.be.a('boolean');
expect( eventObj.success ).to.be.true;
```

should have an "errorMessage" key, null.

```js
expect( eventObj.errorMessage ).to.be.null;
```

should have a "httpStatus" key, number, 200.

```js
expect( eventObj.httpStatus ).to.be.a('number');
expect( eventObj.httpStatus ).to.equal(200);
```

should have a "responseRaw" key, string.

```js
expect( eventObj.responseRaw ).to.be.a('string');
```

should have a "responseRaw" key with the proper value.

```js
expect( eventObj.responseRaw ).to.equal( JSON.stringify(userFix) );
```

should have a "udo" key, object.

```js
expect( eventObj.udo ).to.be.an('object');
```

should have a "udo" key deep equal to the udo fixture.

```js
expect( eventObj.udo ).to.deep.equal( userFix );
```


### Events emitted during 3rd party login operation. Plugin: facebook
should trigger the "user.beforeExtLogin" event.

```js
expect( spyBeforeExtLogin.calledOnce ).to.be.true;
```

should trigger the "user.onExtOauth" event.

```js
expect( spyOnExtAuth.calledOnce ).to.be.true;
```

should emit the "user.extAuthChange" event.

```js
expect( spyExtAuth.calledOnce        ).to.be.true;
```

should emit the "user.beforeLogin" event: true.

```js
expect( spyBeforeLocal.calledOnce === plugin.hasLocalAuth() ).to.be.true;
```

should emit the "user.onLoginResponse" event: true.

```js
expect( spyBeforeResponse.calledOnce === plugin.hasLocalAuth() ).to.be.true;
```

should emit the "user.afterLoginResponse" event: true.

```js
expect( spyAuthResponse.calledOnce === plugin.hasLocalAuth()   ).to.be.true;
```

should emit the "user.authChange" event.

```js
expect( spyAuthChange.calledOnce     ).to.be.true;
```

should emit "user.beforeExtLogin" before "user.onExtOauth".

```js
expect( spyBeforeExtLogin.calledBefore(        spyOnExtAuth    )).to.be.true;
```

should emit "user.onExtOauth" before "user.extAuthChange".

```js
expect( spyOnExtAuth.calledBefore(        spyExtAuth    )).to.be.true;
```

should emit "user.extAuthChange" before "user.beforeLogin".

```js
expect( spyExtAuth.calledBefore(        spyBeforeLocal    )).to.be.true;
```

should emit "user.beforeLogin" before "user.onLoginResponse".

```js
expect( spyBeforeLocal.calledBefore(    spyBeforeResponse )).to.be.true;
```

should emit "user.onLoginResponse" before "user.afterLoginResponse".

```js
expect( spyBeforeResponse.calledBefore( spyAuthResponse   )).to.be.true;
```

should emit "user.afterLoginResponse" before "user.authChange".

```js
expect( spyAuthResponse.calledBefore(   spyAuthChange     )).to.be.true;
```

should provide proper data on the extAuthChange event.

```js
var eventObj = spyExtAuth.getCall(0).args[0];
expect( eventObj.source ).to.be.equal( _this.pluginName );
expect( eventObj.authStatePlugin ).to.be.true;
expect( eventObj.authState ).to.be.false;
expect( eventObj.responsePluginRaw ).to.deep.equal( _this.pluginResponse );
```


### Stop authentication if false is returned on "user.extAuthChange" event. Plugin: facebook
should not emmit the "user.beforeLogin" event.

```js
expect( spyBeforeLocal.called    ).to.be.false;
```

should not emmit the "user.onLoginResponse" event.

```js
expect( spyBeforeResponse.called ).to.be.false;
```

should not emmit the "user.afterLoginResponse" event.

```js
expect( spyAuthResponse.called   ).to.be.false;
```

should not emmit the "user.authChange" event.

```js
expect( spyAuthChange.called     ).to.be.false;
```

should not be globally authed.

```js
expect( ss.isAuthed() ).to.be.false;
```

the plugin should not be authed.

```js
expect( plugin.isAuthed() ).to.be.true;
```


# User Auth Module Plugins :: Twitter

## Proper Interface implementation for twitter
should have a getSourceId() method.

```js
expect( plugin.getSourceId ).to.be.a('function');
```

getSourceId() should return the plugin name.

```js
expect( plugin.getSourceId() ).to.equal( _this.pluginName );
```

should have a login() method.

```js
expect( plugin.login ).to.be.a('function');
```

should have a hasJSAPI() method which returns boolean.

```js
expect( plugin.hasJSAPI() ).to.be.a.boolean;
```

should have a logout() method.

```js
expect( plugin.logout ).to.be.a('function');
```

should have an isAuthed() method and return boolean.

```js
expect( plugin.isAuthed ).to.be.a('function');
expect( plugin.isAuthed() ).to.be.a('boolean');
```

should have a getUdo() method.

```js
expect( plugin.getUdo ).to.be.a('function');
```

getUdo() should return null when not authed with the plugin.

```js
var spy = sinon.spy();
plugin.getUdo(spy);
expect( spy.getCall(0).args[0] ).to.be.a('null');
```

should have a getAccessToken() method.

```js
expect( plugin.getAccessToken ).to.be.a('function');
```

getAccessToken() should always return null.

```js
expect( plugin.getAccessToken() ).to.be.null;
```

should have a logout method.

```js
expect( plugin.logout ).to.be.a('function');
```


## Auth and deAuth methods for twitter

### udo & auth / deAuth plugin tests

#### Perform auth / deauth method tests for plugin
should not be authed.

```js
expect( ss.isAuthed() ).to.be.false;
```

should have an auth method.

```js
expect( _this.plugin.auth ).to.be.a('function');
```

should have a deAuth method.

```js
expect( _this.plugin.deAuth ).to.be.a('function');
```

should authenticate globaly.

```js
_this.plugin.auth();
expect( ss.isAuthed() ).to.be.true;
```

should de-authenticate globaly.

```js
_this.plugin.deAuth();
expect( ss.isAuthed() ).to.be.false;
```


## Login tests for plugin: twitter

### login callback tests
should have a callback.

```js
expect(spyCB.calledOnce).to.be.true;
```

should have a callback with 5 arguments.

```js
expect( spyCB.args[0].length ).to.equal(5);
```

should have a callback with arg1, the error message, null.

```js
expect( spyCB.args[0][0] ).to.be.null;
```

should have a callback with arg2, authState, boolean.

```js
expect( spyCB.args[0][1] ).to.be.a('boolean');
```

should have a callback with arg3, udo, object.

```js
expect( spyCB.args[0][2] ).to.be.an('object');
```

should have a callback with arg4, server response raw, null.

```js
expect( spyCB.args[0][3] ).to.be.an(_this.loginCbArg4Type);
```

should have a callback with arg5, third-party response raw, string.

```js
expect( spyCB.args[0][4] ).to.be.an(_this.loginCbArg5Type);
```

should have a proper 3rd party response data object provided on the callback.

```js
expect( spyCB.getCall(0).args[4] ).to.deep.equal(_this.pluginResponse);
```


### utility methods
should return false when asked if hasJSAPI().

```js
expect( plugin.hasJSAPI() ).to.equal(_this.hasJSAPI);
```

should verify with local server.

```js
plugin.login();
expect( stubNet.calledOnce === plugin.hasLocalAuth() ).to.be.true;
```

should globally authenticate us.

```js
plugin.login();
expect( ss.isAuthed() ).to.be.true;
```

should exist in the authedSources() returning array.

```js
plugin.login();
expect( ss.user.authedSources() ).to.include(_this.pluginName);
```

should return the UDO as provided by the plugin.

```js
plugin.login();
var spy = sinon.spy();
plugin.getUdo( spy );
expect( spy.getCall(0).args[0] ).to.deep.equal(_this.pluginUDO);
```

should return the Access Token of the plugin.

```js
plugin.login();
expect( plugin.getAccessToken() ).to.equal(
  _this.accessToken);
```


## Event tests for plugin: twitter

### Basic login events

#### standard EVENTS
should be authed.

```js
expect( ss.isAuthed() ).to.be.true;
```

should trigger the "user.authChange" event.

```js
expect( spyAuthChange.calledOnce ).to.be.true;
```

should have an authState and be true when triggering the "user.authChange" event.

```js
expect( spyAuthChange.getCall(0).args[0].authState ).to.be.true;
```


### Events emitted during 3rd party login operation. Plugin: twitter
should trigger the "user.beforeExtLogin" event.

```js
expect( spyBeforeExtLogin.calledOnce ).to.be.true;
```

should trigger the "user.onExtOauth" event.

```js
expect( spyOnExtAuth.calledOnce ).to.be.true;
```

should emit the "user.extAuthChange" event.

```js
expect( spyExtAuth.calledOnce        ).to.be.true;
```

should emit the "user.beforeLogin" event: false.

```js
expect( spyBeforeLocal.calledOnce === plugin.hasLocalAuth() ).to.be.true;
```

should emit the "user.onLoginResponse" event: false.

```js
expect( spyBeforeResponse.calledOnce === plugin.hasLocalAuth() ).to.be.true;
```

should emit the "user.afterLoginResponse" event: false.

```js
expect( spyAuthResponse.calledOnce === plugin.hasLocalAuth()   ).to.be.true;
```

should emit the "user.authChange" event.

```js
expect( spyAuthChange.calledOnce     ).to.be.true;
```

should emit "user.beforeExtLogin" before "user.onExtOauth".

```js
expect( spyBeforeExtLogin.calledBefore(        spyOnExtAuth    )).to.be.true;
```

should emit "user.onExtOauth" before "user.extAuthChange".

```js
expect( spyOnExtAuth.calledBefore(        spyExtAuth    )).to.be.true;
```

should emit "user.extAuthChange" before "user.authChange".

```js
expect( spyExtAuth.calledBefore(        spyAuthChange    )).to.be.true;
```

should provide proper data on the extAuthChange event.

```js
var eventObj = spyExtAuth.getCall(0).args[0];
expect( eventObj.source ).to.be.equal( _this.pluginName );
expect( eventObj.authStatePlugin ).to.be.true;
expect( eventObj.authState ).to.be.false;
expect( eventObj.responsePluginRaw ).to.deep.equal( _this.pluginResponse );
```


### Stop authentication if false is returned on "user.extAuthChange" event. Plugin: twitter
should not emmit the "user.authChange" event.

```js
expect( spyAuthChange.called     ).to.be.false;
```

should not be globally authed.

```js
expect( ss.isAuthed() ).to.be.false;
```

the plugin should not be authed.

```js
expect( plugin.isAuthed() ).to.be.true;
```
