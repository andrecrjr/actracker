import { hook } from '@modern-js/runtime/server';
import express from 'express';
import { authenticate } from './middleware/authentication';

const app = express();
app.use(express.json());

// app.use(async (req, res, next) => {
//   authenticate(req, res, next);
// });

// hook(({ addMiddleware }) => {
//   addMiddleware((req, res, next) => {
//     console.log(`estou aqui tb ${req.url}`);
//     next();
//   });
// });

export default app;
