// src/middleware/errorHandler.js
export function errorHandler(err, req, res, next) {
  console.error('API Error:', err);

  // PostgreSQL unique_violation (e.g., duplicate product_id)
  if (err?.code === '23505') {
    return res.status(409).json({
      error: 'A lunch menu item with this product_id already exists.',
    });
  }

  // PostgreSQL invalid_text_representation (e.g., wrong data type for column)
  if (err?.code === '22P02') {
    return res.status(400).json({
      error: 'Invalid field type for one of the columns in LUNCH MENU.',
    });
  }

  return res.status(500).json({
    error: 'Internal server error while communicating with the database.',
  });
}