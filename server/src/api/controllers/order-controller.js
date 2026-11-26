import {
  addOrder,
  listAllOrders,
  listOrdersByUserId,
  modifyOrderStatus,
} from '../models/order-model.js';
import {findProductsByIds} from '../models/product-model.js';
import {findProfileByAuthId} from '../models/user-model.js';
import {httpError} from '../../utils/http-error.js';

const getProfileOrFail = async (res) => {
  const profile = await findProfileByAuthId(
    res.locals.supabase,
    res.locals.user.id,
  );
  if (!profile) throw httpError(404, 'No profile is linked to this account');
  return profile;
};

const getMyOrders = async (req, res) => {
  const profile = await getProfileOrFail(res);
  res.json(await listOrdersByUserId(res.locals.supabase, profile.user_id));
};

const getAllOrders = async (req, res) => {
  res.json(await listAllOrders(res.locals.supabase));
};

const postOrder = async (req, res, next) => {
  const client = res.locals.supabase;
  const requestedItems = req.body.items;
  const profile = await getProfileOrFail(res);

  // Prices always come from the database, never from the client
  const productIds = requestedItems.map((item) => item.product_id);
  const products = await findProductsByIds(client, productIds);
  if (products.length !== productIds.length) {
    return next(httpError(400, 'One or more products do not exist'));
  }
  const productsById = new Map(products.map((p) => [p.product_id, p]));

  let totalCents = 0;
  const items = [];
  for (const {product_id, quantity} of requestedItems) {
    const product = productsById.get(product_id);
    const unitPrice = Number(product.price);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return next(httpError(502, 'A product has an invalid price'));
    }
    const unitCents = Math.round(unitPrice * 100);
    totalCents += unitCents * quantity;
    items.push({
      product_id,
      name: product.name,
      quantity,
      unit_price: unitCents / 100,
      line_total: (unitCents * quantity) / 100,
    });
  }

  const order = await addOrder(client, {
    user_id: profile.user_id,
    date: new Date().toISOString().slice(0, 10),
    order_detail: JSON.stringify({items, total: totalCents / 100}),
  });
  res.status(201).json(order);
};

const patchOrderStatus = async (req, res, next) => {
  const order = await modifyOrderStatus(
    res.locals.supabase,
    req.params.id,
    req.body.order_status,
  );
  if (!order) return next(httpError(404, 'Order not found'));
  res.json(order);
};

export {getMyOrders, getAllOrders, postOrder, patchOrderStatus};
