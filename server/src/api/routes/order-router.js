import express from 'express';
import {body, param} from 'express-validator';
import {
  getAllOrders,
  getMyOrders,
  patchOrderStatus,
  postOrder,
} from '../controllers/order-controller.js';
import {authenticateToken} from '../../middlewares/authentication.js';
import {authorizeAdmin} from '../../middlewares/authorization.js';
import {validationErrors} from '../../middlewares/error-handlers.js';

const orderRouter = express.Router();

// must match the orders_status_check constraint in the database
const ORDER_STATUSES = [
  'pending',
  'preparing',
  'ready',
  'completed',
  'cancelled',
];

const validateNewOrder = [
  body('items').isArray({min: 1, max: 50}),
  body('items.*.product_id').isInt({min: 1}).toInt(),
  body('items.*.quantity').isInt({min: 1, max: 20}).toInt(),
  body('items')
    .custom((items) => {
      const ids = items.map((item) => item.product_id);
      return new Set(ids).size === ids.length;
    })
    .withMessage('Each product may appear only once'),
  validationErrors,
];

// /api/v1/orders
orderRouter
  .route('/')
  .get(authenticateToken, getMyOrders)
  .post(authenticateToken, validateNewOrder, postOrder);

// /api/v1/orders/admin
orderRouter.get('/admin', authenticateToken, authorizeAdmin, getAllOrders);

// /api/v1/orders/:id/status
orderRouter.patch(
  '/:id/status',
  authenticateToken,
  authorizeAdmin,
  param('id').isInt({min: 1}).toInt(),
  body('order_status').isIn(ORDER_STATUSES),
  validationErrors,
  patchOrderStatus,
);

export default orderRouter;
