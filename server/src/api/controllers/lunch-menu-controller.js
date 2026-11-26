import {
  addLunchMenuItem,
  listLunchMenuItems,
  modifyLunchMenuItem,
  removeLunchMenuItem,
} from '../models/lunch-menu-model.js';
import {httpError} from '../../utils/http-error.js';

const getLunchMenu = async (req, res) => {
  const {date, category} = req.query;
  const items = await listLunchMenuItems({date, category});
  res.json({count: items.length, data: items});
};

const postLunchMenuItem = async (req, res) => {
  const item = await addLunchMenuItem(res.locals.supabase, req.body);
  res.status(201).json({message: 'Lunch menu item added.', data: item});
};

const putLunchMenuItem = async (req, res, next) => {
  const item = await modifyLunchMenuItem(
    res.locals.supabase,
    req.params.id,
    req.body,
  );
  if (!item) return next(httpError(404, 'Lunch menu item not found'));
  res.json({message: 'Lunch menu item updated.', data: item});
};

const deleteLunchMenuItem = async (req, res, next) => {
  const item = await removeLunchMenuItem(res.locals.supabase, req.params.id);
  if (!item) return next(httpError(404, 'Lunch menu item not found'));
  res.json({message: 'Lunch menu item deleted.', data: item});
};

export {
  getLunchMenu,
  postLunchMenuItem,
  putLunchMenuItem,
  deleteLunchMenuItem,
};
