import {supabase, createUserClient} from '../config/supabase.js';

async function authenticate(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({error: 'Authentication required'});
  }

  const token = authorization.slice('Bearer '.length);
  const {data, error} = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({error: 'Invalid or expired session'});
  }

  req.user = data.user;
  req.supabase = createUserClient(token);
  next();
}

export default authenticate;
