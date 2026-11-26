import express from 'express';
import authenticate from '../middleware/authenticate.js';
import authorizeAdmin from '../middleware/authorize.js';

const router = express.Router();

router.get('/admin', authenticate, authorizeAdmin, async (req, res) => {
  const {data, error} = await req.supabase
    .from('ORDERS')
    .select('order_id, user_id, date, order_detail, order_status')
    .order('date', {ascending: false});

  if (error) {
    console.error('Could not load all orders:', error.message);
    return res.status(502).json({error: 'Could not load all orders'});
  }

  return res.json(data);
});

router.patch(
  '/:orderId/status',
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    const orderId = Number(req.params.orderId);
    const status = req.body?.order_status;

    if (
      !Number.isSafeInteger(orderId) ||
      orderId < 1 ||
      typeof status !== 'string' ||
      status.trim() === ''
    ) {
      return res.status(400).json({
        error: 'Provide a valid order ID and non-empty order_status',
      });
    }

    const {data, error} = await req.supabase
      .from('ORDERS')
      .update({order_status: status.trim()})
      .eq('order_id', orderId)
      .select('order_id, user_id, date, order_detail, order_status')
      .maybeSingle();

    if (error) {
      console.error('Could not update order status:', error.message);
      return res.status(502).json({error: 'Could not update order status'});
    }

    if (!data) {
      return res.status(404).json({error: 'Order not found'});
    }

    return res.json(data);
  },
);

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

router.post('/', authenticate, async (req, res) => {
  const requestedItems = req.body?.items;

  if (
    !Array.isArray(requestedItems) ||
    requestedItems.length === 0 ||
    requestedItems.length > 50
  ) {
    return res.status(400).json({error: 'Order must contain 1 to 50 items'});
  }

  const productIds = new Set();

  for (const item of requestedItems) {
    if (
      !Number.isSafeInteger(item?.product_id) ||
      item.product_id < 1 ||
      !Number.isSafeInteger(item?.quantity) ||
      item.quantity < 1 ||
      item.quantity > 20 ||
      productIds.has(item.product_id)
    ) {
      return res.status(400).json({
        error: 'Each item needs a unique product_id and quantity from 1 to 20',
      });
    }

    productIds.add(item.product_id);
  }

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

  const {data: products, error: productsError} = await req.supabase
    .from('PRODUCTS')
    .select('product_id, name, price')
    .in('product_id', [...productIds]);

  if (productsError) {
    console.error('Could not load order products:', productsError.message);
    return res.status(502).json({error: 'Could not validate order products'});
  }

  if (products.length !== productIds.size) {
    return res.status(400).json({error: 'One or more products do not exist'});
  }

  const productsById = new Map(
    products.map((product) => [product.product_id, product]),
  );

  const items = requestedItems.map(({product_id, quantity}) => {
    const product = productsById.get(product_id);
    const unitPrice = Number(product.price);

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return null;
    }

    const unitPriceCents = Math.round(unitPrice * 100);

    return {
      product_id,
      name: product.name,
      quantity,
      unit_price: unitPriceCents / 100,
      line_total: (unitPriceCents * quantity) / 100,
    };
  });

  if (items.some((item) => item === null)) {
    return res.status(502).json({error: 'A product has an invalid price'});
  }

  const totalCents = items.reduce(
    (total, item) => total + Math.round(item.unit_price * 100) * item.quantity,
    0,
  );

  const {data: order, error: insertError} = await req.supabase
    .from('ORDERS')
    .insert({
      user_id: profile.user_id,
      date: new Date().toISOString().slice(0, 10),
      order_detail: JSON.stringify({items, total: totalCents / 100}),
    })
    .select('order_id, date, order_detail, order_status')
    .single();

  if (insertError) {
    console.error('Could not create order:', insertError.message);
    return res.status(502).json({error: 'Could not create order'});
  }

  return res.status(201).json(order);
});

export default router;
