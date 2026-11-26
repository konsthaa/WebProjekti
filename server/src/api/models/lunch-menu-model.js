import {supabase} from '../../utils/supabase.js';
import {dbError} from '../../utils/http-error.js';

const TABLE = 'LUNCH MENU';
const COLUMNS = 'product_id, name, price, category, date, Veg, Glut, Lacto';

const listLunchMenuItems = async ({date, category} = {}) => {
  let query = supabase
    .from(TABLE)
    .select(COLUMNS)
    .order('date', {ascending: true})
    .order('category', {ascending: true})
    .order('name', {ascending: true});

  if (date) query = query.eq('date', date);
  if (category) query = query.eq('category', category);

  const {data, error} = await query;
  if (error) throw dbError(error, 'Could not load lunch menu');
  return data;
};

const addLunchMenuItem = async (client, item) => {
  const payload = {
    product_id: item.product_id,
    name: item.name.trim(),
    price: Number(item.price),
    category: item.category.trim(),
    date: item.date,
    Veg: item.Veg ?? false,
    Glut: item.Glut ?? false,
    Lacto: item.Lacto ?? false,
  };

  const {data, error} = await client
    .from(TABLE)
    .insert(payload)
    .select(COLUMNS)
    .single();

  // 23505 = PostgreSQL unique_violation
  if (error?.code === '23505') {
    const duplicate = new Error('A lunch menu item with this product_id exists');
    duplicate.status = 409;
    throw duplicate;
  }
  if (error) throw dbError(error, 'Could not create lunch menu item');
  return data;
};

const modifyLunchMenuItem = async (client, productId, updates) => {
  const payload = {};
  for (const field of ['name', 'category']) {
    if (updates[field] !== undefined) payload[field] = updates[field].trim();
  }
  if (updates.price !== undefined) payload.price = Number(updates.price);
  for (const field of ['date', 'Veg', 'Glut', 'Lacto']) {
    if (updates[field] !== undefined) payload[field] = updates[field];
  }

  const {data, error} = await client
    .from(TABLE)
    .update(payload)
    .eq('product_id', productId)
    .select(COLUMNS)
    .maybeSingle();

  if (error) throw dbError(error, 'Could not update lunch menu item');
  return data;
};

const removeLunchMenuItem = async (client, productId) => {
  const {data, error} = await client
    .from(TABLE)
    .delete()
    .eq('product_id', productId)
    .select(COLUMNS)
    .maybeSingle();

  if (error) throw dbError(error, 'Could not delete lunch menu item');
  return data;
};

export {
  listLunchMenuItems,
  addLunchMenuItem,
  modifyLunchMenuItem,
  removeLunchMenuItem,
};
