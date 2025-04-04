import { hook } from '@modern-js/runtime/server';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

if (!process.env.JWT_SECRET) {
  console.warn(
    'WARNING: JWT_SECRET environment variable is not set. Using fallback secret. This is insecure for production.',
  );
}

export default hook(({ addMiddleware }) => {
  addMiddleware((req: Request, res: Response, next: NextFunction): void => {
    const publicRoutes = [
      '/api/sign/login',
      '/api/sign/verify-code',
      '/api/auth',
    ];
    if (!publicRoutes.includes(req.url)) {
      const token =
        req.cookies?.token || req.headers.authorization?.split(' ')[1];
      if (!token) {
        res.status(401).json({ message: 'Autenticação necessária' });
        return;
      }
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        (req as any).query.userId = decoded.userId;
        next();
      } catch (error) {
        res.status(401).json({ message: 'Token inválido ou expirado' });
        return;
      }
    } else {
      next();
    }
  });
});
