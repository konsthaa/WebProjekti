import express from 'express';
import {body} from 'express-validator';
import {
  deleteProduct,
  getAllProducts,
  postProduct,
  putProduct,
} from '../controllers/product-controller.js';
import {authenticateToken} from '../../middlewares/authentication.js';
import {authorizeAdmin} from '../../middlewares/authorization.js';
import {validationErrors} from '../../middlewares/error-handlers.js';

const productRouter = express.Router();

const isNonEmptyObject = (value) =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.keys(value).length > 0;

const validateProduct = [
  body().custom(isNonEmptyObject).withMessage('Provide a non-empty product'),
  validationErrors,
];

// /api/v1/products
productRouter
  .route('/')
  .get(getAllProducts)
  .post(authenticateToken, authorizeAdmin, validateProduct, postProduct);

// /api/v1/products/:id
productRouter
  .route('/:id')
  .put(authenticateToken, authorizeAdmin, validateProduct, putProduct)
  .delete(authenticateToken, authorizeAdmin, deleteProduct);

export default productRouter;
