const express = require('express');
const {supabase} = require('../supabase');

const router = express.Router();

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

module.exports = router;
