import path from 'node:path';
import {fileURLToPath} from 'node:url';
import http from 'node:http';
import express from 'express';
import ordersRouter from './routes/orders.js';
import productsRouter from './routes/products.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// Proxy lunch menu requests to the standalone lunch menu API.
app.use('/api/lunch-menu', (req, res) => {
  const lunchMenuApiUrl = new URL(
    process.env.LUNCH_MENU_API_URL || 'http://localhost:3001',
  );
  const target = new URL(
    req.originalUrl,
    `${lunchMenuApiUrl.protocol}//${lunchMenuApiUrl.host}`,
  );

  const proxyRequest = http.request(
    target,
    {
      method: req.method,
      headers: {
        ...req.headers,
        host: target.host,
      },
    },
    (proxyResponse) => {
      res.status(proxyResponse.statusCode || 500);
      for (const [name, value] of Object.entries(proxyResponse.headers)) {
        if (value !== undefined) res.setHeader(name, value);
      }
      proxyResponse.pipe(res);
    },
  );

  proxyRequest.on('error', (error) => {
    if (res.headersSent) {
      res.destroy(error);
      return;
    }

    res.status(502).json({
      error: 'Could not reach the lunch menu API.',
    });
  });

  req.pipe(proxyRequest);
});

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
