// src/app.js
import express from 'express';
import menuRoutes from './routes/menuRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/lunch-menu', menuRoutes);

app.use(errorHandler);

export default app;