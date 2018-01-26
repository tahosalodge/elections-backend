/**
 * Helper function to create error objects
 * @param  {String} message    Description of error that occured.
 * @param  {Number} [code=500] HTTP Status Code
 * @return {Error}             Error object
 */
const createError = (message, code = 500) => {
  const error = new Error(message);
  error.code = code;
  return error;
};

module.exports = createError;
