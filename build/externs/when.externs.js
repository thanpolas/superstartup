
/**
 * [when description]
 * @param  {[type]} promiseOrValue [description]
 * @param  {[type]} onFulfilled    [description]
 * @param  {[type]} onRejected     [description]
 * @param  {[type]} onProgress     [description]
 * @return {[type]}                [description]
 */
function when (promiseOrValue, onFulfilled, onRejected, onProgress) {}

/**
 * Create a deferred
 *
 * @return {when.deferred} a deferred.
 */
function when.defer(){}

/**
 * Create a resolved promise
 */
function when.resolve(){}
/**
 * Create a rejected promise
 */
function when.reject(){}
/**
 * Join 2 or more promises
 */
function when.join(){}
/**
 * Resolve a list of promises
 */
function when.all(){}
/**
 * Array.map() for promises
 */
function when.map(){}
/**
 * Array.reduce() for promises
 */
function when.reduce(){}
/**
 * One-winner race
 */
function when.any(){}
/**
 * Multi-winner race
 */
function when.some(){}
/**
 * Make a promise trigger another resolver
 */
function when.chain(){}
/**
 * Determine if a thing is a promise
 */
function when.isPromise(){}


when.deferred = {
  then:     function(){}, // DEPRECATED: use deferred.promise.then
  resolve:  function(){},
  reject:   function(){},
  progress: function(){}, // DEPRECATED: use deferred.notify
  notify:   function(){},
  promise:  function(){},
  resolver: {
    resolve:  function(){},
    reject:   function(){},
    progress: function(){}, // DEPRECATED: use deferred.notify
    notify:   function(){}
  }
};
