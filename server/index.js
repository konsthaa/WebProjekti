const path = require('node:path');
const express = require('express');
const ordersRouter = require('./routes/orders');
const productsRouter = require('./routes/products');

const app = express();
const port = Number(process.env.PORT) || 3000;
const distPath = path.join(__dirname, '../client/dist');

app.use(express.json());

// Frontend static files
app.use(express.static(distPath));

// Api routes
app.get('/api/health', (_req, res) => {
  res.json({status: 'ok'});
});

app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

// React-router: serve index.html for all non-API routes
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Unhandled API routes
app.use((_req, res) => {
  res.status(404).json({error: 'API route not found'});
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
