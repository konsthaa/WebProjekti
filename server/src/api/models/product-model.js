import {supabase} from '../../utils/supabase.js';
import {dbError} from '../../utils/http-error.js';

const TABLE = 'PRODUCTS';

const listAllProducts = async () => {
  const {data, error} = await supabase
    .from(TABLE)
    .select('*')
    .order('product_id', {ascending: true});

  if (error) throw dbError(error, 'Could not load products');
  return data;
};

const findProductsByIds = async (client, ids) => {
  const {data, error} = await client
    .from(TABLE)
    .select('product_id, name, price')
    .in('product_id', ids);

  if (error) throw dbError(error, 'Could not validate order products');
  return data;
};

const addProduct = async (client, product) => {
  const {data, error} = await client
    .from(TABLE)
    .insert(product)
    .select('*')
    .single();

  if (error) throw dbError(error, 'Could not create product');
  return data;
};

const modifyProduct = async (client, id, product) => {
  const {data, error} = await client
    .from(TABLE)
    .update(product)
    .eq('product_id', id)
    .select('*')
    .maybeSingle();

  if (error) throw dbError(error, 'Could not update product');
  return data;
};

const removeProduct = async (client, id) => {
  const {data, error} = await client
    .from(TABLE)
    .delete()
    .eq('product_id', id)
    .select('product_id')
    .maybeSingle();

  if (error) throw dbError(error, 'Could not delete product');
  return data;
};

export {
  listAllProducts,
  findProductsByIds,
  addProduct,
  modifyProduct,
  removeProduct,
};
