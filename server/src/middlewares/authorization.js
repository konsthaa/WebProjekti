import {findProfileByAuthId} from '../api/models/user-model.js';
import {httpError} from '../utils/http-error.js';

/**
 * Allows only users whose USERS.role is 'admin'.
 * Must be used after authenticateToken.
 */
const authorizeAdmin = async (req, res, next) => {
  const profile = await findProfileByAuthId(
    res.locals.supabase,
    res.locals.user.id,
    'role',
  );

  if (profile?.role !== 'admin') {
    return next(httpError(403, 'Admin access required'));
  }
  next();
};

export {authorizeAdmin};
