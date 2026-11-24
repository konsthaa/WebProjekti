// src/routes/menuRoutes.js
import { Router } from 'express';
import {
  handleDeleteMenuItem,
  handleGetMenu,
  handlePostMenuItem,
  handlePutMenuItem,
} from '../controllers/menuController.js';
import requireAdmin from '../middleware/requireAdmin.js';
import {
  validateCreateMenuItem,
  validateUpdateMenuItem,
} from '../middleware/validateMenuItem.js';

const router = Router();

router.get('/', handleGetMenu);
router.post('/', requireAdmin, validateCreateMenuItem, handlePostMenuItem);
router.put(
  '/:productId',
  requireAdmin,
  validateUpdateMenuItem,
  handlePutMenuItem,
);
router.delete('/:productId', requireAdmin, handleDeleteMenuItem);

export default router;