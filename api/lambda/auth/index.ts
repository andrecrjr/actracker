import { useContext } from '@modern-js/runtime/express';
import { Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const get = async (): Promise<{
  isAuthenticated: boolean;
  message?: string;
  userId?: string;
}> => {
  const { req, res } = useContext();
  console.log('estou aqui');
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  console.log('cuques', req.cookies.token);
  if (!token) {
    return {
      message: 'Autenthentication Needed',
      isAuthenticated: false,
      userId: '',
    };
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userDataId = decoded.userId;
    console.log('entrei fi', userDataId);
    return { isAuthenticated: true };
  } catch (error) {
    return { message: 'Token inválido ou expirado', isAuthenticated: false };
  }
};
