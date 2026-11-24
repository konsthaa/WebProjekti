async function authorizeAdmin(req, res, next) {
  const {data: profile, error} = await req.supabase
    .from('USERS')
    .select('role')
    .eq('auth_user_id', req.user.id)
    .maybeSingle();

  if (error) {
    console.error('Could not load user role:', error.message);
    return res.status(502).json({error: 'Could not verify user permissions'});
  }

  if (profile?.role !== 'admin') {
    return res.status(403).json({error: 'Admin access required'});
  }

  return next();
}

export default authorizeAdmin;