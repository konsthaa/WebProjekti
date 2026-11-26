export function validateCreateMenuItem(req, res, next) {
  const { product_id, name, price, category, date, Veg, Glut, Lacto } = req.body ?? {};

  if (
    product_id === undefined ||
    product_id === null ||
    String(product_id).trim() === '' ||
    typeof name !== 'string' ||
    name.trim() === '' ||
    typeof price !== 'number' ||
    Number.isNaN(price) ||
    price < 0 ||
    typeof category !== 'string' ||
    category.trim() === '' ||
    typeof date !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    (Veg !== undefined && typeof Veg !== 'boolean') ||
    (Glut !== undefined && typeof Glut !== 'boolean') ||
    (Lacto !== undefined && typeof Lacto !== 'boolean')
  ) {
    return res.status(400).json({
      error:
        'Invalid payload. Required: product_id, non-empty name, non-negative numeric price, non-empty category, and date (YYYY-MM-DD). Veg, Glut, and Lacto must be booleans when provided.',
    });
  }

  return next();
}

export function validateUpdateMenuItem(req, res, next) {
  const { name, price, category, date, Veg, Glut, Lacto } = req.body ?? {};
  const hasAnyField = [name, price, category, date, Veg, Glut, Lacto].some((val) => val !== undefined);

  if (!hasAnyField) {
    return res.status(400).json({
      error: 'Provide at least one updatable field: name, price, category, date, Veg, Glut, or Lacto.',
    });
  }

  if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
    return res.status(400).json({ error: 'Field "name" must be a non-empty string.' });
  }

  if (price !== undefined && (typeof price !== 'number' || Number.isNaN(price) || price < 0)) {
    return res.status(400).json({ error: 'Field "price" must be a non-negative number.' });
  }

  if (category !== undefined && (typeof category !== 'string' || category.trim() === '')) {
    return res.status(400).json({ error: 'Field "category" must be a non-empty string.' });
  }

  if (date !== undefined && (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date))) {
    return res.status(400).json({ error: 'Field "date" must use YYYY-MM-DD format.' });
  }

  for (const field of ['Veg', 'Glut', 'Lacto']) {
    if (req.body?.[field] !== undefined && typeof req.body[field] !== 'boolean') {
      return res.status(400).json({ error: `Field "${field}" must be a boolean.` });
    }
  }

  return next();
}