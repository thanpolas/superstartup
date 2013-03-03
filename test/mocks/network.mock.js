
goog.provide('ssd.test.mock.net');

/**
 * @param  {*} responseRaw [description]
 * @return {ssd.ajax.ResponseObject}
 */
ssd.test.mock.net.getResponse = function (responseRaw) {
  return {
    httpStatus: 200,
    success: true,
    responseRaw: JSON.stringify(responseRaw),
    errorMessage: null
  };
};
