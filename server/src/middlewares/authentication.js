import {supabase, createUserClient} from '../utils/supabase.js';
import {httpError} from '../utils/http-error.js';

/**
 * Verifies the Supabase access token from the Authorization header.
 * Adds res.locals.user (Supabase user) and res.locals.supabase
 * (client that acts as that user).
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(httpError(401, 'Authentication required'));
  }

  const {data, error} = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return next(httpError(401, 'Invalid or expired session'));
  }

  res.locals.user = data.user;
  res.locals.supabase = createUserClient(token);
  next();
};

export {authenticateToken};
