import {dbError} from '../../utils/http-error.js';

const TABLE = 'ORDERS';
const COLUMNS = 'order_id, date, order_detail, order_status';

const listOrdersByUserId = async (client, userId) => {
  const {data, error} = await client
    .from(TABLE)
    .select(COLUMNS)
    .eq('user_id', userId)
    .order('date', {ascending: false});

  if (error) throw dbError(error, 'Could not load orders');
  return data;
};

const listAllOrders = async (client) => {
  const {data, error} = await client
    .from(TABLE)
    .select(`user_id, ${COLUMNS}`)
    .order('date', {ascending: false});

  if (error) throw dbError(error, 'Could not load all orders');
  return data;
};

const addOrder = async (client, order) => {
  const {data, error} = await client
    .from(TABLE)
    .insert(order)
    .select(COLUMNS)
    .single();

  if (error) throw dbError(error, 'Could not create order');
  return data;
};

const modifyOrderStatus = async (client, orderId, status) => {
  const {data, error} = await client
    .from(TABLE)
    .update({order_status: status})
    .eq('order_id', orderId)
    .select(`user_id, ${COLUMNS}`)
    .maybeSingle();

  if (error) throw dbError(error, 'Could not update order status');
  return data;
};

export {listOrdersByUserId, listAllOrders, addOrder, modifyOrderStatus};
