
goog.provide('goog.test.mock.net');

/**
 * @param  {*} responseRaw [description]
 * @return {ssd.ajax.ResponseObject}
 */
goog.test.mock.net.getResponse = function (responseRaw) {
  return {
    httpStatus: 200,
    success: true,
    responseRaw: JSON.stringify(responseRaw),
    errorMessage: null
  };
};
