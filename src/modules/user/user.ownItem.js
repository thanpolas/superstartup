/*jshint camelcase:false */
/**
 * @fileoverview A single user data object
 *
 */
goog.provide('ssd.user.OwnItem');
goog.require('ssd.user.Item');

/**
 * The currently logged in user's data object.
 *
 * @constructor
 * @param {ssd.user.types.user=} optUdo a user data object to init with
 * @extends {ssd.user.Item}
 */
ssd.user.OwnItem = function(optUdo) {
  return goog.base(this, optUdo);
};
goog.inherits(ssd.user.OwnItem, ssd.user.Item);


/**
 * The authed users data object validator.
 *
 * Checks that the data object provided is proper.
 *
 * @param  {Object} udo The data object we want to validate.
 * @return {boolean} If the object validates.
 */
ssd.user.OwnItem.prototype.validate = function (udo)
{
  // prepare and emit BEFORE VALIDATE event, check if
  // we got a preventDefault or similar...
  var eventObj = {
      type: ssd.user.Auth.EventType.USERDATA_BEFORE_VALIDATE,
      'udo': udo
  };
  if ( false === this.dispatchEvent(eventObj) ) {
    return false;
  }

  return ssd.user.OwnItem.superClass_.validate.call(this, udo);
};