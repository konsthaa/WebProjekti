import {validationResult} from 'express-validator';
import {httpError} from '../utils/http-error.js';

const notFoundHandler = (req, res, next) => {
  next(httpError(404, `Not Found - ${req.originalUrl}`));
};

/**
 * Custom default middleware for handling errors
 */
const errorHandler = (err, req, res, _next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    error: {
      message: status >= 500 && !err.status ? 'Internal server error' : err.message,
      status,
    },
  });
};

/**
 * Collects express-validator errors and forwards them as one 400 error
 */
const validationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors
      .array()
      .map((error) => `${error.path}: ${error.msg}`)
      .join(', ');
    return next(httpError(400, messages));
  }
  next();
};

export {notFoundHandler, errorHandler, validationErrors};
