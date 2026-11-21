import { supabase } from '../config/supabase.js';

const TABLE_NAME = 'LUNCH MENU';
const COLUMNS = 'product_id, name, price, category, date';

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

export async function createMenuItem(item) {
  const payload = {
    product_id: item.product_id,
    name: item.name.trim(),
    price: Number(item.price),
    category: item.category.trim(),
    date: item.date,
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateMenuItem(productId, updates) {
  const payload = {};

  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.price !== undefined) payload.price = Number(updates.price);
  if (updates.category !== undefined) payload.category = updates.category.trim();
  if (updates.date !== undefined) payload.date = updates.date;

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(payload)
    .eq('product_id', productId)
    .select(COLUMNS)
    .maybeSingle();

  if (error) throw error;
  return data;
}