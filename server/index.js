const express = require('express');
const productsRouter = require('./routes/products');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({status: 'ok'});
});

app.use('/api/products', productsRouter);

app.use((_req, res) => {
  res.status(404).json({error: 'API route not found'});
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
