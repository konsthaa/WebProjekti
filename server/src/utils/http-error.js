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
 * Logs a Supabase error and turns it into a 502 error for the client.
 *
 * @param {object} dbError - error object returned by supabase-js
 * @param {string} message - message sent to the client
 * @return {Error}
 */
const dbError = (dbError, message) => {
  console.error(`${message}:`, dbError.message);
  return httpError(502, message);
};

export {httpError, dbError};
