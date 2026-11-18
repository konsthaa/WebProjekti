const express = require('express');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  const {data: profile, error: profileError} = await req.supabase
    .from('USERS')
    .select('user_id')
    .eq('auth_user_id', req.user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Could not load user profile:', profileError.message);
    return res.status(502).json({error: 'Could not load user profile'});
  }

  if (!profile) {
    return res
      .status(404)
      .json({error: 'No profile is linked to this account'});
  }

  const {data: orders, error: ordersError} = await req.supabase
    .from('ORDERS')
    .select('order_id, date, order_detail, order_status')
    .eq('user_id', profile.user_id)
    .order('date', {ascending: false});

  if (ordersError) {
    console.error('Could not load orders:', ordersError.message);
    return res.status(502).json({error: 'Could not load orders'});
  }

  return res.json(orders);
});

module.exports = router;
