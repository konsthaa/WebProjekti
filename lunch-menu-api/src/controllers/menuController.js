import {
  createMenuItem,
  deleteMenuItem,
  getMenuItems,
  updateMenuItem,
} from '../services/menuService.js';

export async function handleGetMenu(req, res, next) {
  try {
    const { date, category } = req.query;
    const items = await getMenuItems({ date, category });
    res.status(200).json({
      count: items.length,
      data: items,
    });
  } catch (err) {
    next(err);
  }
}

export async function handlePostMenuItem(req, res, next) {
  try {
    const created = await createMenuItem(req.body, req.supabase);
    res.status(201).json({
      message: 'Lunch menu item added.',
      data: created,
    });
  } catch (err) {
    next(err);
  }
}

export async function handlePutMenuItem(req, res, next) {
  try {
    const { productId } = req.params;
    const updated = await updateMenuItem(productId, req.body, req.supabase);

    if (!updated) {
      return res.status(404).json({
        error: `Lunch menu item with product_id "${productId}" was not found.`,
      });
    }

    return res.status(200).json({
      message: 'Lunch menu item updated.',
      data: updated,
    });
  } catch (err) {
    return next(err);
  }
}

export async function handleDeleteMenuItem(req, res, next) {
  try {
    const deleted = await deleteMenuItem(req.params.productId, req.supabase);

    if (!deleted) {
      return res.status(404).json({
        error: `Lunch menu item with product_id "${req.params.productId}" was not found.`,
      });
    }

    return res.status(200).json({
      message: 'Lunch menu item deleted.',
      data: deleted,
    });
  } catch (err) {
    return next(err);
  }
}