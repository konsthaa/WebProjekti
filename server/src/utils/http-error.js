/**
 * Creates an Error with an HTTP status, handled by errorHandler middleware.
 *
 * @param {number} status - HTTP status code
 * @param {string} message - message sent to the client
 * @return {Error}
 */
const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

/**
 * Logs a Supabase error and turns it into an HTTP error for the client:
 * rejected data (check constraint 23514, wrong type 22P02) -> 400,
 * everything else -> 502.
 *
 * @param {object} dbError - error object returned by supabase-js
 * @param {string} message - message sent to the client
 * @return {Error}
 */
const dbError = (dbError, message) => {
  console.error(`${message}:`, dbError.message);
  if (['23514', '22P02'].includes(dbError.code)) {
    return httpError(400, `${message}: invalid data`);
  }
  return httpError(502, message);
};

export {httpError, dbError};
