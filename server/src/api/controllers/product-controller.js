import {
  addProduct,
  listAllProducts,
  modifyProduct,
  removeProduct,
} from '../models/product-model.js';
import {httpError} from '../../utils/http-error.js';

const getAllProducts = async (req, res) => {
  res.json(await listAllProducts());
};

const postProduct = async (req, res) => {
  const product = await addProduct(res.locals.supabase, req.body);
  res.status(201).json(product);
};

const putProduct = async (req, res, next) => {
  if (Object.hasOwn(req.body, 'product_id')) {
    return next(httpError(400, 'product_id cannot be changed'));
  }
  const product = await modifyProduct(
    res.locals.supabase,
    req.params.id,
    req.body,
  );
  if (!product) return next(httpError(404, 'Product not found'));
  res.json(product);
};

const deleteProduct = async (req, res, next) => {
  const product = await removeProduct(res.locals.supabase, req.params.id);
  if (!product) return next(httpError(404, 'Product not found'));
  res.status(204).end();
};

export {getAllProducts, postProduct, putProduct, deleteProduct};
