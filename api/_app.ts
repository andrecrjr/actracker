import { IGetUserAuthInfoRequest } from '@/types';
import { hook } from '@modern-js/runtime/server';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

export default hook(({ addMiddleware }) => {
  addMiddleware(
    (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
      // Define as rotas que não requerem autenticação
      const publicRoutes = ['/api/login', '/api/register'];

      if (!publicRoutes.includes(req.url)) {
        // Tenta obter o token dos cookies ou do cabeçalho Authorization
        const token =
          req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
          return res
            .status(401)
            .json({ code: -1, message: 'Autenticação necessária' });
        }

        try {
          // Verifica e decodifica o token JWT
          const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
          // Armazena o ID do usuário na requisição para uso posterior
          req.userId = decoded.userId;
          next();
        } catch (error) {
          return res
            .status(401)
            .json({ code: -1, message: 'Token inválido ou expirado' });
        }
      } else {
        next();
      }
    },
  );
});
