import express from 'express';
import {body, query} from 'express-validator';
import {
  deleteLunchMenuItem,
  getLunchMenu,
  postLunchMenuItem,
  putLunchMenuItem,
} from '../controllers/lunch-menu-controller.js';
import {authenticateToken} from '../../middlewares/authentication.js';
import {authorizeAdmin} from '../../middlewares/authorization.js';
import {validationErrors} from '../../middlewares/error-handlers.js';

const lunchMenuRouter = express.Router();

const diets = ['Veg', 'Glut', 'Lacto'];
const updatable = ['name', 'price', 'category', 'date', ...diets];

const validateCreate = [
  body('product_id').notEmpty(),
  body('name').isString().trim().notEmpty(),
  body('price').isFloat({min: 0}),
  body('category').isString().trim().notEmpty(),
  body('date').isISO8601({strict: true, strictSeparator: true}),
  ...diets.map((field) => body(field).optional().isBoolean({strict: true})),
  validationErrors,
];

const validateUpdate = [
  body('name').optional().isString().trim().notEmpty(),
  body('price').optional().isFloat({min: 0}),
  body('category').optional().isString().trim().notEmpty(),
  body('date').optional().isISO8601({strict: true, strictSeparator: true}),
  ...diets.map((field) => body(field).optional().isBoolean({strict: true})),
  body()
    .custom((value) => updatable.some((field) => value?.[field] !== undefined))
    .withMessage('Provide at least one updatable field'),
  validationErrors,
];

// /api/v1/lunch-menu
lunchMenuRouter
  .route('/')
  .get(
    query('date').optional().isISO8601({strict: true}),
    validationErrors,
    getLunchMenu,
  )
  .post(authenticateToken, authorizeAdmin, validateCreate, postLunchMenuItem);

// /api/v1/lunch-menu/:id
lunchMenuRouter
  .route('/:id')
  .put(authenticateToken, authorizeAdmin, validateUpdate, putLunchMenuItem)
  .delete(authenticateToken, authorizeAdmin, deleteLunchMenuItem);

export default lunchMenuRouter;
