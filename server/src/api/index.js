import express from 'express';
import productRouter from './routes/product-router.js';
import orderRouter from './routes/order-router.js';
import lunchMenuRouter from './routes/lunch-menu-router.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({status: 'ok'});
});

// bind base url for each resource to its own router
router.use('/products', productRouter);
router.use('/orders', orderRouter);
router.use('/lunch-menu', lunchMenuRouter);

export default router;
