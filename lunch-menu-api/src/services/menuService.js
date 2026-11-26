import { supabase } from '../config/supabase.js';

const TABLE_NAME = 'LUNCH MENU';
const COLUMNS = 'product_id, name, price, category, date, Veg, Glut, Lacto';

export async function getMenuItems({ date, category } = {}) {
  let query = supabase
    .from(TABLE_NAME)
    .select(COLUMNS)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (date) {
    query = query.eq('date', date);
  }

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createMenuItem(item, client = supabase) {
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

  const { data, error } = await client
    .from(TABLE_NAME)
    .insert(payload)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateMenuItem(productId, updates, client = supabase) {
  const payload = {};

  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.price !== undefined) payload.price = Number(updates.price);
  if (updates.category !== undefined) payload.category = updates.category.trim();
  if (updates.date !== undefined) payload.date = updates.date;
  if (updates.Veg !== undefined) payload.Veg = updates.Veg;
  if (updates.Glut !== undefined) payload.Glut = updates.Glut;
  if (updates.Lacto !== undefined) payload.Lacto = updates.Lacto;

  const { data, error } = await client
    .from(TABLE_NAME)
    .update(payload)
    .eq('product_id', productId)
    .select(COLUMNS)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteMenuItem(productId, client = supabase) {
  const {data, error} = await client
    .from(TABLE_NAME)
    .delete()
    .eq('product_id', productId)
    .select(COLUMNS)
    .maybeSingle();

  if (error) throw error;
  return data;
}