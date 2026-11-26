import path from 'node:path';
import {fileURLToPath} from 'node:url';
import express from 'express';
import router from './api/index.js';
import {errorHandler, notFoundHandler} from './middlewares/error-handlers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, '../../client/dist');
const port = Number(process.env.PORT) || 3000;

const app = express();

// needed for reading request body in JSON format
app.use(express.json());

// Frontend static files (vite build output)
app.use(express.static(distPath));

// All /api/v1 requests go to the api router (api/index.js)
app.use('/api/v1', router);

// Unknown API routes -> JSON 404 (must come before the SPA fallback)
app.use('/api', notFoundHandler);

// React-router: serve index.html for everything else
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Add error handler middleware as the last middleware in the chain
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
