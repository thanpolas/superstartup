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

/**
 * The ready method will either init a new ready
 * watch or exit. If we need to force initialisation
 * we need to set the second parameter to true
 *
 * @param {string} nameId Unique identifier
 * @param {boolean=} opt_forceInit If we need to force Init
 * @return void
 */
ss.ready = function(nameId, opt_forceInit)
{
    var log = goog.debug.Logger.getLogger('ss.ready');
    var w = core;
    var r = w.ready;

    log.info('Init - nameId:' + nameId + ' opt_forceInit:' + opt_forceInit);

    var nameId = nameId || null;



    opt_forceInit = opt_forceInit || false;

    //var newr = new r(nameId);

    var arReady = w.arFindIndex(r.db.allReady, 'nameId', nameId);
    if (0 <= arReady) {
        // already instanciated

        if (opt_forceInit) {
            // we will reset the values
            r.db.allReady[arReady].nameId = nameId;
            r.db.allReady[arReady].done = false;
            r.db.allReady[arReady].execOk = true;
            r.db.allReady[arReady].checks = [];
            r.db.allReady[arReady].fn = [];
        }

        return;
        /*
        this.checks = arReady.checks;
        this.fn = arReady.fn;
        this.done = arReady.done;
        this.boo = arReady.boo;
        return this;
        */
    }
    var readyObj = {
        nameId: nameId,
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

     r.db.allReady.push(readyObj);

}; // ss.ready Constructor

ss.ready.log = goog.debug.Logger.getLogger('ss.ready');

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
    var w = core;
    var r = w.ready;
    var g = goog;
    var nameId = nameId || null;
    var arReady = w.arFind(r.db.allReady, 'nameId', nameId);

    var log = g.debug.Logger.getLogger('ss.ready.isDone');
    log.fine('Init - nameId:' + nameId + ' arReady.done:' + arReady.done);

    if (g.isNull(arReady)) return false;

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
    var w = core;
    var r = w.ready;
    var g = goog;
    var nameId = nameId || null;

    var arReady = w.arFind(r.db.allReady, 'nameId', nameId);

    var log = g.debug.Logger.getLogger('ss.ready.isDoneCheck');
    log.fine('Init - nameId:' + nameId + ' arReady.done:' + arReady.done);

    if (g.isNull(arReady)) return false;

    // find the check now
    var arCheck = w.arFind(arReady.check, 'checkId', checkId);
    if (g.isNull(arCheck)) return false;

    return arCheck.done;
}; // method ss.ready.isDoneCheck



/**
 * Pushes a listener function down the ready queue...
 *
 * @param {string} nameId The name ID
 * @param {function} fn callback function
 * @param {Number=} opt_delay optionaly set a delay to execute fn in ms
 * @return {void}
 */
ss.ready.addFunc = function(nameId, fn, opt_delay)
{
    var c = core;
    var log = c.log('ss.ready.addFunc');

    var nameId = nameId || null;

    log.fine('Init - nameId:' + nameId);

    // find index of nameId or if it exists...
    var ind = c.arFindIndex(c.ready.db.allReady, 'nameId', nameId);
    if (-1 == ind) {
        // not initialised yet, init it...
        log.info('Ready watch not initialised. Doing so now...');
        c.ready(nameId);
        var ind = c.arFindIndex(c.ready.db.allReady, 'nameId', nameId);
        if (-1 == ind) {
            // thats a big oops
            log.shout('Could not find ready index after init of key:' + nameId);
            return;
        }
    }
    log.fine('pushing to index:' + ind);
    // push the function object after we create it
    var fnObj = {
      fn: fn,
      delay: opt_delay || 0
    }
    c.ready.db.allReady[ind].fn.push(fnObj);

    // if watch is finished then we execute the function right away...
    if (c.ready.isDone(nameId))
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
    var w = core;
    var g = goog;
    var log = g.debug.Logger.getLogger('ss.ready.addFuncCheck');

    var nameId = nameId || null;

    log.fine('Init - nameId:' + nameId);

    // find index of nameId or if it existw...
    var ind = w.arFindIndex(w.ready.db.allReady, 'nameId', nameId);
    if (-1 == ind) {
        // not initialised yet, init it...
        w.ready(nameId);
        var ind = w.arFindIndex(w.ready.db.allReady, 'nameId', nameId);
        if (-1 == ind) {
            // thats a big oops
            w.ready.log.shout('Could not find ready index after init of key:' + nameId);
            return;
        }
    }

    // assign the ready data object
    var r = w.ready.db.allReady[ind];

    // now see if we can find this check
    var arCheck = w.arFind(r.check, 'checkId', checkId);
    if (g.isNull(arCheck)) {
        // no, doesn't exist, create it
        r.checks.push({
            checkId: checkId,
            done: false
        });
    } // if we didn't find the check



    // push the function down the checks listeners
    r.fnCheck.push({
        checkId: checkId,
        fn: fn
    });

    // if watch is finished then we execute the function right away...
    if (w.ready.isDoneCheck(nameId, checkId))
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
  try {
    var w = core;
    var nameId = nameId || null;
    var log = goog.debug.Logger.getLogger('ss.ready.addCheck');
    log.fine('Init - nameId:' + nameId + ' checkId:' + checkId);


    // find index of nameId or if it exists...
    var ind = w.arFindIndex(w.ready.db.allReady, 'nameId', nameId);
    if (-1 == ind) {
        // create the main watch first
        w.ready(nameId);
        // now look it up again
        var ind = w.arFindIndex(w.ready.db.allReady, 'nameId', nameId);
    }

    var readyObj = w.ready.db.allReady[ind];

    // check if this checkId is already created
    var indCheck = w.arFindIndex(readyObj.checks, 'checkId', checkId);
    if (-1 == indCheck) {
        // yup, not found...
        readyObj.checks.push({
            checkId: checkId,
            done: false
        });
    }
  } catch (e) {ss.error(e);}
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
    try {
    var g = goog;
    var w = core;
    var nameId = nameId || null;

    var log = g.debug.Logger.getLogger('ss.ready.check');
    log.info('Init - Check DONE nameId:' + nameId + ' checkId:' + checkId);

    var check_state = opt_state || true;

    // find index of nameId or if it exists...
    var ind = w.arFindIndex(w.ready.db.allReady, 'nameId', nameId);
    if (-1 == ind) {
        log.severe('Could not find ready watch with nameId:' + nameId);
        return false;
    }
    // shortcut assign the ready object
    var readyObj = w.ready.db.allReady[ind];

    // check for check's method execution state and if false assign it
    if (!check_state) readyObj.execOk = false;

    // find the check string in our array of checks...
    var indCheck = w.arFindIndex(readyObj.checks, 'checkId', checkId);

    if (-1 == indCheck) {
        log.info('Check not found in watch:' + nameId + ' check:' + checkId);
        // not found in checks, check if we have no checks left
        if (w.ready._isChecksComplete(nameId)) {
            // all is done
            readyObj.done = true; // set Ready Watch's switch
            // run all listeners
            w.ready._runAll(nameId);
        }
        return;
    }

    // mark the check as done
    readyObj.checks[indCheck].done = true;
    // execute check's listeners (if any)
    w.ready._runAllChecks(nameId, checkId);

    // check if all cheks are done
    if (w.ready._isChecksComplete(nameId)) {
        log.shout('Done watch:' + nameId);
        readyObj.done = true;
        // run all listeners
        w.ready._runAll(nameId);
    } else {
        log.info('NOT Done watch:' + nameId);
    }
    } catch(e) {ss.error(e);}
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
    try {
    var g = goog;
    var w = core;
    var log = w.log('ss.ready._isChecksComplete');

    // find index of nameId or if it exists...
    var ind = w.arFindIndex(w.ready.db.allReady, 'nameId', nameId);
    if (-1 == ind) {
        log.severe('ready watch not found:' + nameId);
        return false;
    }

    // shortcut assign the ready object
    var readyObj = w.ready.db.allReady[ind];

    // check if we have no checks in this warch
    if (0 == readyObj.checks.length) {
        log.warning('No checks for this watch (length 0)');
        return false
    }

    var allChecksDone = true;
    // now go through all the checks in this ready watch
    g.array.forEach(readyObj.checks, function (checkObj, index){
        if (!checkObj.done) {
            //log.shout('Watch:' + nameId + ' check:' + checkObj.checkId + ' NOT DONE');
            allChecksDone = false
        }
    });

    //log.shout('deep.expose:' + g.debug.deepExpose(readyObj.checks));

    return allChecksDone;

    } catch(e) {ss.error(e);}
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
    try {
    var g = goog;
    var w = core;
    var log = w.log('ss.ready._runAll');

    log.info('Executing all listeners for:' + nameId)

    // find index of nameId or if it exists...
    var ind = w.arFindIndex(w.ready.db.allReady, 'nameId', nameId);
    if (-1 == ind) {
        log.severe('ready watch was not found! name:' + nameId);
        return false;
    }

    var readyObj = w.ready.db.allReady[ind];

    log.info('Total listeners:' + readyObj.fn.length + ' Total check listeners:' + readyObj.fnCheck.length);

    // go for all checks listeners first
    g.array.forEach(readyObj.fnCheck, function (fnObj, index){
      try {
        if (!g.isFunction(fnObj.fn)) {
          log.warning('Listener not a function:' + g.debug.expose(fnObj) + ' index:' + index);
        } else {
          fnObj.fn(readyObj.execOk);
        }
      } catch(e) {ss.error(e);}
    });
    // empty the array
    readyObj.fnCheck = new Array();

    // now go for all main ready watch listeners
    g.array.forEach(readyObj.fn, function(fnObj, index) {
      try {
        log.shout('Executing watch ' + nameId + ' fn No:' + index + ' delay:' + fnObj.delay);
        var fn = fnObj.fn;
        if (!g.isFunction(fn)) {
          log.warning('We found a non function to execute for:' + nameId + ' fn:' + fn + ' index:' + index);
          return;
        }
        // exec callback method with state of execution after set delay...
        if (0 == fnObj.delay)
          fn(readyObj.execOk);
        else
          setTimeout(fn, fnObj.delay);
      } catch(e) {ss.error(e);}
    });
    // reset function container array of watch...
    readyObj.fn = new Array();
    } catch(e) {ss.error(e);}
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
    try {
    var g = goog;
    var w = core;

    // find index of nameId or if it exists...
    var ind = w.arFindIndex(w.ready.db.allReady, 'nameId', nameId);
    if (-1 == ind) {
        return;
    }

    var readyObj = w.ready.db.allReady[ind];


    // init array for all check's listeners' ID
    var removeFuncs = new Array();
    // go for all checks' listeners
    g.array.forEach(readyObj.fnCheck, function (fnObj, index){
        if (fnObj.checkId == checkId) {
            // execute the listener
            fnObj.fn(readyObj.execOk);
            // push the executed listener index
            removeFuncs.push(index);
        }
    });
    // remove all listeners we executed
    g.array.forEachRight(removeFuncs, function (fnIndex, index){
        g.array.removeAt(readyObj.fnCheck, fnIndex);
    });

    // all done


    } catch(e) {ss.error(e);}
}; // ss.ready._runAllChecks

