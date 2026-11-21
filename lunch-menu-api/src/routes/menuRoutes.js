// src/routes/menuRoutes.js
import { Router } from 'express';
import {
  handleGetMenu,
  handlePostMenuItem,
  handlePutMenuItem,
} from '../controllers/menuController.js';
import {
  validateCreateMenuItem,
  validateUpdateMenuItem,
} from '../middleware/validateMenuItem.js';

const router = Router();

router.get('/', handleGetMenu);
router.post('/', validateCreateMenuItem, handlePostMenuItem);
router.put('/:productId', validateUpdateMenuItem, handlePutMenuItem);

export default router;