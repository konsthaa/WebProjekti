import express from 'express';
import {supabase} from '../config/supabase.js';
import authenticate from '../middleware/authenticate.js';
import authorizeAdmin from '../middleware/authorize.js';

const router = express.Router();

function validateProductBody(req, res, next) {
  if (
    req.body === null ||
    typeof req.body !== 'object' ||
    Array.isArray(req.body) ||
    Object.keys(req.body).length === 0
  ) {
    return res.status(400).json({error: 'Provide a non-empty product object'});
  }

  return next();
}

router.get('/', async (_req, res) => {
  try {
    const {data, error} = await supabase
      .from('PRODUCTS')
      .select('*')
      .order('product_id', {ascending: true});

    if (error) {
      console.error('Supabase product query failed:', error.message);
      return res.status(502).json({error: error.message});
    }

    return res.json(data);
  } catch (error) {
    console.error('Product route failed:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unexpected server error',
    });
  }
});

router.post('/', authenticate, authorizeAdmin, validateProductBody, async (req, res) => {
  const {data, error} = await req.supabase
    .from('PRODUCTS')
    .insert(req.body)
    .select('*')
    .single();

  if (error) {
    console.error('Could not create product:', error.message);
    return res.status(502).json({error: 'Could not create product'});
  }

  return res.status(201).json(data);
});

router.put(
  '/:productId',
  authenticate,
  authorizeAdmin,
  validateProductBody,
  async (req, res) => {
    if (Object.hasOwn(req.body, 'product_id')) {
      return res.status(400).json({error: 'product_id cannot be changed'});
    }

    const {data, error} = await req.supabase
      .from('PRODUCTS')
      .update(req.body)
      .eq('product_id', req.params.productId)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Could not update product:', error.message);
      return res.status(502).json({error: 'Could not update product'});
    }

    if (!data) {
      return res.status(404).json({error: 'Product not found'});
    }

    return res.json(data);
  },
);

router.delete('/:productId', authenticate, authorizeAdmin, async (req, res) => {
  const {data, error} = await req.supabase
    .from('PRODUCTS')
    .delete()
    .eq('product_id', req.params.productId)
    .select('product_id')
    .maybeSingle();

  if (error) {
    console.error('Could not delete product:', error.message);
    return res.status(502).json({error: 'Could not delete product'});
  }

  if (!data) {
    return res.status(404).json({error: 'Product not found'});
  }

  return res.status(204).end();
});

export default router;
