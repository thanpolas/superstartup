/**
 *  @copyright  (C) 2000-2011 Thanasis Polychronakis - All Rights Reserved
 *  @author Thanasis Polychronakis <thanasisp@gmail.com>
 *
 *********
 * This program is bound to the license agreement that can be found in the root
 * folder of this project. This Agreement does not give you any intellectual property
 * rights in the program. It does not Grand you permission to copy, distribute, redistribute
 * or make any possible use of this program, this is a private work intended for private use.
 *
 * You should have received a copy of the License Agreement along with this program
 * If not, write to: Plastikopiitiki S.A., Attn: Thanasis Polychronakis, P.O. Box 60374,
 * Zip 57001, Thermi, Greece
 *
 *
 *********
 * created on Jun 16, 2011
 * metric_flash.js A metric for flash
 *
 */


goog.provide('web.metrics.flash');


web.metrics.flash.db = {
  isOn: false, // if metric is running
  hasInited: false,
  queue: new Array()
};

/**
 * This function is called primarily from
 * the tagLand parser after the DOM is
 * ready, we were selected and a random number of
 * seconds have passed.
 *
 *
 *
 * We initialize the flash metric
 *
 * @param {boolean=} opt_openModal If we were called from open camera model
 * @return {void}
 */
web.metrics.flash.init = function(opt_openModal)
{
  try {

    var c = core, w = web, g = goog;
    var db = w.metrics.flash.db;
    var log = c.log('web.metrics.flash.init');

    log.info('Init. isOn:' + db.isOn + ' hasInited:' + db.hasInited);

    // check if metric is off
    if (!db.isOn)
      return;

    // check if we are authed
    if (!c.isAuthed())
      return;

    // check if we have already initialized
    if (db.hasInited) {
      // we have, check if we were called from Open Camera Model
      if (opt_openModal)
        w.metrics.flash.count('openModal');

      // exit
      return;
    }


    db.hasInited = true;

    //TODO Hook to Camera LOAD event when possible

    var aj = new c.ajax('/mtr/flash', {
        postMethod: 'POST',
        action: 'init'
        , showMsg: false // don't show default success message
        , showErrorMsg: false // don't show error message if it happens
      });

      aj.addData('hf', g.userAgent.flash.HAS_FLASH);
      aj.addData('fv', g.userAgent.flash.VERSION);
      if (opt_openModal)
        aj.addData('openModal', true);



      aj.callback = function(){
        // init finished (hopefully), check if we have anything in the queue...
        g.array.forEach(db.queue, function(item, index){
          w.metrics.flash.count(item);
        });
      };

      // send ajax request
      aj.send();


  } catch (e) {
    core.error(e);
  };



}; // web.metrics.flash.init



/**
 * Set the flash metric to On
 *
 * @return {void}
 */
web.metrics.flash.setOn = function()
{
  try {
    web.metrics.flash.db.isOn = true;
  } catch (e) {
    core.error(e);
  }


}; //web.metrics.flash.init setOn



/**
 * Perform a count metric for flash
 *
 * 'what' can be one of:
 *  allow, deny, first, second
 *
 *  @param {string} what one of:  allow, deny, first, second, live
 *  @param {Function=} opt_callback Optionaly set a callback for when we finish
 *  @return {void}
 */
web.metrics.flash.count = function(what, opt_callback)
{
  try {
    var c = core, w = web;
    var db = w.metrics.flash.db;
    var log = c.log('web.metrics.flash.count');

    log.info('Init. what:' + what + ' isOn:' + db.isOn + ' hasInited:' + db.hasInited);

    // check for SFV
    if (w.SFV)
      return;

    // check if we don't have initialized
    if (!db.hasInited) {
      // haven't inited yet... queue the count...
      db.queue.push(what);
      return;
    }

    // check if metric is off
    if (!db.isOn)
      return;


    var fn = opt_callback ||  function(){};

    var aj = new c.ajax('/mtr/flash', {
      postMethod: 'POST',
      action: 'count'
    , showMsg: false // don't show default success message
    , showErrorMsg: false // don't show error message if it happens
    });

    aj.addData('what', what);

    aj.callback = fn;

    // send ajax request
    aj.send();




  } catch (e) {
    core.error(e);
  }

}; // web.metrics.flash.count

