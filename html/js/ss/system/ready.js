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
 * createdate 03/Mar/2010
 *
 *********
 *  File:: system/ready.js
 *  Create ready statuses when having to wait for multiple async
 *  operations to finish before executing next step
 *********
 */


/**
 * Init the ss.ready object
 *
 */
goog.provide('ss.ready');

goog.require('ss.helpers');

/**
 * The ready method will either init a new ready
 * watch or exit. If we need to force initialisation
 * we need to set the second parameter to true
 *
 * @param {string|function} nameId Unique identifier or function that will attach
 *      to our framework's ready event...
 * @param {boolean=} opt_forceInit If we need to force Init
 * @return void
 */
ss.ready = function(nameId, opt_forceInit)
{
    if(goog.isFunction(nameId)) {
      ss.ready.addFunc('main', nameId);
      return;
    }

    opt_forceInit = opt_forceInit || false;

    //var newr = new r(nameId);

    var arReady = ss.arFindIndex(ss.ready.db.allReady, 'nameId', nameId);
    if (0 <= arReady) {
        // already instanciated

        if (opt_forceInit) {
            // we will reset the values
            ss.ready.db.allReady[arReady]['nameId'] = nameId;
            ss.ready.db.allReady[arReady].done = false;
            ss.ready.db.allReady[arReady].execOk = true;
            ss.ready.db.allReady[arReady].checks = [];
            ss.ready.db.allReady[arReady].fn = [];
        }

        return;
    }
    var readyObj = {
        'nameId': nameId,
        execOk: true, // if all executed ok
        done: false,
        execOk: true,
        /**
         * checks watch array
         *
         * Each object in this array has:
         *
         * checkId: {string}
         * done: {boolean}
         *
         */
        checks: [],
        /**
         * Functions to execute when the ready watch
         * finishes.
         *
         * Each element in this array is an object with this structure:
         * {
         *    fn: {Function},
         *    delay: 0, // delay in MS, 0 for none
         * }
         */
        fn: [],
        /**
         * Check only functions
         * Each object in this array must have two keys:
         * checkId: {string}
         * fn: {Function()}
         */
        fnCheck: []
    };


    /**
     * Declare ourselves to static DB
     */

     ss.ready.db.allReady.push(readyObj);
}; // ss.ready



/**
 * Static Data Container
 */
ss.ready.db = {
    allReady: []
};

/**
 * Checks if a certain name exists and has finished
 * doing it's stuff...
 *
 * @param {string} nameId The id of the ready event
 * @return {boolean}
 */
ss.ready.isDone = function (nameId)
{
    var arReady = ss.arFind(ss.ready.db.allReady, 'nameId', nameId);
    if (goog.isNull(arReady)) return false;

    return arReady.done;
}; // method ss.ready.isDone

/**
 * Checks if a certain name and specific check exists and has finished
 * doing it's stuff...
 *
 * @param {string} nameId The id of the ready event
 * @param {string} checkId The id of the check
 * @return {boolean}
 */
ss.ready.isDoneCheck = function (nameId, checkId)
{
    var arReady = ss.arFind(ss.ready.db.allReady, 'nameId', nameId);
    if (goog.isNull(arReady)) return false;
    // find the check now
    var arCheck = ss.arFind(arReady.check, 'checkId', checkId);
    if (goog.isNull(arCheck)) return false;
    return arCheck.done;
}; // method ss.ready.isDoneCheck



/**
 * Pushes a listener function down the ready queue...
 *
 * @param {string} nameId The name ID
 * @param {Function} fn callback function
 * @param {Number=} opt_delay optionaly set a delay to execute fn in ms
 * @return {void}
 */
ss.ready.addFunc = function(nameId, fn, opt_delay)
{
    // find index of nameId or if it exists...
    var ind = ss.arFindIndex(ss.ready.db.allReady, 'nameId', nameId);
    if (-1 == ind) {
        // not initialised yet, init it...
        ss.ready(nameId);
        ss.arFindIndex(ss.ready.db.allReady, 'nameId', nameId);
        if (-1 == ind) {
            // thats a big oops
            return;
        }
    }
    // push the function object after we create it
    var fnObj = {
      fn: fn,
      delay: opt_delay || 0
    };
    ss.ready.db.allReady[ind].fn.push(fnObj);

    // if watch is finished then we execute the function right away...
    if (ss.ready.isDone(nameId))
        fn();
}; // method ss.ready.addFunc


/**
 * Pushes a callback function down the ready queue...
 *
 * But listens for a specific check instread of the whole
 * process to complete
 *
 * If the main ready (nameId) is not set yet, we set it
 * same with check. So take care to not create checks
 * that will never get checked, resulting in the ready
 * watch to never fire as well
 *
 * @param {string} nameId The name ID
 * @param {string} checkId The name of the check ID
 * @param {function} fn callback function
 * @return void
 */
ss.ready.addFuncCheck = function(nameId, checkId, fn)
{
    // find index of nameId or if it existw...
    var ind = ss.arFindIndex(ss.ready.db.allReady, 'nameId', nameId);
    if (-1 == ind) {
        // not initialised yet, init it...
        ss.ready(nameId);
        ss.arFindIndex(ss.ready.db.allReady, 'nameId', nameId);
        if (-1 == ind) {
            // thats a big oops
            return;
        }
    }

    // assign the ready data object
    var rdb = ss.ready.db.allReady[ind];

    // now see if we can find this check
    var arCheck = ss.arFind(rdb.check, 'checkId', checkId);
    if (goog.isNull(arCheck)) {
        // no, doesn't exist, create it
        rdb.checks.push({
            'checkId': checkId,
            done: false
        });
    } // if we didn't find the check



    // push the function down the checks listeners
    rdb.fnCheck.push({
        'checkId': checkId,
        fn: fn
    });

    // if watch is finished then we execute the function right away...
    if (ss.ready.isDoneCheck(nameId, checkId))
        fn();
}; // method ss.ready.addFuncCheck


/**
 * Adds a check watch to wait for checking
 * before firing the ready function
 *
 * @param {string} nameId The name ID
 * @param {string} checkId The check string id we will use as a switch
 * @return void
 */
ss.ready.addCheck = function(nameId, checkId)
{
    // find index of nameId or if it exists...
    var ind = ss.arFindIndex(ss.ready.db.allReady, 'nameId', nameId);
    if (-1 == ind) {
        // create the main watch first
        ss.ready(nameId);
        // now look it up again
        ind = ss.arFindIndex(ss.ready.db.allReady, 'nameId', nameId);
    }

    var readyObj = ss.ready.db.allReady[ind];

    // check if this checkId is already created
    var indCheck = ss.arFindIndex(readyObj.checks, 'checkId', checkId);
    if (-1 == indCheck) {
        // yup, not found...
        readyObj.checks.push({
            'checkId': checkId,
            done: false
        });
    }
}; // method ss.ready.addCheck


/**
 * Checks a watch, if it's the last one to check
 * then we execute the ready function
 *
 * @param {string} nameId The name ID
 * @param {string} checkId The check string id we will use as a switch
 * @param {boolean=} opt_state If check method failed, set this to false
 * @return void
 */
ss.ready.check = function(nameId, checkId, opt_state)
{
    var check_state = opt_state || true;

    // find index of nameId or if it exists...
    var ind = ss.arFindIndex(ss.ready.db.allReady, 'nameId', nameId);
    if (-1 == ind) {
        return false;
    }
    // shortcut assign the ready object
    var readyObj = ss.ready.db.allReady[ind];

    // check for check's method execution state and if false assign it
    if (!check_state) readyObj.execOk = false;

    // find the check string in our array of checks...
    var indCheck = ss.arFindIndex(readyObj.checks, 'checkId', checkId);

    if (-1 == indCheck) {
        // not found in checks, check if we have no checks left
        if (ss.ready._isChecksComplete(nameId)) {
            // all is done
            readyObj.done = true; // set Ready Watch's switch
            // run all listeners
            ss.ready._runAll(nameId);
        }
        return;
    }

    // mark the check as done
    readyObj.checks[indCheck].done = true;
    // execute check's listeners (if any)
    ss.ready._runAllChecks(nameId, checkId);

    // check if all checks are done
    if (ss.ready._isChecksComplete(nameId)) {
        readyObj.done = true;
        // run all listeners
        ss.ready._runAll(nameId);
    } else {
      // not done
    }
}; // method ss.ready.check

/**
 * This private function will check if all
 * the checks in a ready watch have completed
 *
 * @param {string} namedId the ready watch name
 * @return {boolean}
 * @private
 */
ss.ready._isChecksComplete = function (nameId)
{
    // find index of nameId or if it exists...
    var ind = ss.arFindIndex(ss.ready.db.allReady, 'nameId', nameId);
    if (-1 == ind) {
        // severe, watch not found
        return false;
    }

    // shortcut assign the ready object
    var readyObj = ss.ready.db.allReady[ind];

    // check if we have no checks in this warch
    if (0 == readyObj.checks.length) {
        //No checks for this watch (length 0)
        return false;
    }

    var allChecksDone = true;
    // now go through all the checks in this ready watch
    goog.array.forEach(readyObj.checks, function (checkObj, index){
        if (!checkObj.done) {
            allChecksDone = false;
        }
    });
    return allChecksDone;
}; // ss.ready._isChecksComplete

/**
 * Run all listeners for a ready watch
 *
 * We will also run (first) all checks listeners
 *
 * All listeners will be deleted after run
 *
 * @param {string} namedId the ready watch name
 * @return {boolean}
 */
ss.ready._runAll = function (nameId)
{
    // find index of nameId or if it exists...
    var ind = ss.arFindIndex(ss.ready.db.allReady, 'nameId', nameId);
    if (-1 == ind) {
        // ready watch was not found!
        return false;
    }

    var readyObj = ss.ready.db.allReady[ind];

    // go for all checks listeners first
    goog.array.forEach(readyObj.fnCheck, function (fnObj, index){
        if (!goog.isFunction(fnObj.fn)) {
          //Listener not a function
        } else {
          fnObj.fn(readyObj.execOk);
        }
    });
    // empty the array
    readyObj.fnCheck = new Array();

    // now go for all main ready watch listeners
    goog.array.forEach(readyObj.fn, function(fnObj, index) {
        var fn = fnObj.fn;
        if (!goog.isFunction(fn)) {
          //We found a non function to execute
          return;
        }
        // exec callback method with state of execution after set delay...
        if (0 == fnObj.delay)
          fn(readyObj.execOk);
        else
          setTimeout(fn, fnObj.delay);
    });
    // reset function container array of watch...
    readyObj.fn = new Array();
}; // ss.ready._runAll


/**
 * Run all listeners for a specific check
 *
 *
 * All listeners will be deleted after run
 *
 * @param {string} namedId the ready watch name
 * @param {string} checkId The check we want to execute the listeners of
 * @return {void}
 */
ss.ready._runAllChecks = function (nameId, checkId)
{
    // find index of nameId or if it exists...
    var ind = ss.arFindIndex(ss.ready.db.allReady, 'nameId', nameId);
    if (-1 == ind) {
        return;
    }

    var readyObj = ss.ready.db.allReady[ind];


    // init array for all check's listeners' ID
    var removeFuncs = new Array();
    // go for all checks' listeners
    goog.array.forEach(readyObj.fnCheck, function (fnObj, index){
        if (fnObj.checkId == checkId) {
            // execute the listener
            fnObj.fn(readyObj.execOk);
            // push the executed listener index
            removeFuncs.push(index);
        }
    });
    // remove all listeners we executed
    goog.array.forEachRight(removeFuncs, function (fnIndex, index){
        goog.array.removeAt(readyObj.fnCheck, fnIndex);
    });

    // all done

};

