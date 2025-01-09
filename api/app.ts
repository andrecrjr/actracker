import express from 'express';
import { authenticate } from './middleware/authentication';

const app = express();
app.use(async (req, res, next) => {
  console.info(`access url: ${req.url}`);
  next();
});

app.use(async (req, res, next) => {
  authenticate(req, res, next);
});

export default app;
