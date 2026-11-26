import {createUserClient, supabase} from '../config/supabase.js';

async function requireAdmin(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({error: 'Authentication required'});
  }

  const accessToken = authorization.slice('Bearer '.length);
  const {data, error} = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return res.status(401).json({error: 'Invalid or expired session'});
  }

  const userClient = createUserClient(accessToken);
  const {data: profile, error: profileError} = await userClient
    .from('USERS')
    .select('role')
    .eq('auth_user_id', data.user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Could not load user role:', profileError.message);
    return res.status(502).json({error: 'Could not verify user permissions'});
  }

  if (profile?.role !== 'admin') {
    return res.status(403).json({error: 'Admin access required'});
  }

  req.user = data.user;
  req.supabase = userClient;
  return next();
}

export default requireAdmin;
