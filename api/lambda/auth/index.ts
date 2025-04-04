import { User } from '@api/models';
import { useContext } from '@modern-js/runtime/express';
import { Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

if (!process.env.JWT_SECRET) {
  console.warn(
    'WARNING: JWT_SECRET environment variable is not set. Using fallback secret. This is insecure for production.',
  );
}

export const get = async (): Promise<{
  isAuthenticated: boolean;
  message?: string;
  userId?: string;
  email?: string;
}> => {
  const { req, res } = useContext();
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
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
    if (!userDataId) {
      return {
        message: 'Autenthentication Needed',
        isAuthenticated: false,
        userId: '',
      };
    }
    const data = await User.findById(userDataId);

    if (!data) {
      return {
        message: 'User not found',
        isAuthenticated: false,
        userId: '',
      };
    }

    return {
      isAuthenticated: true,
      email: data.email,
      userId: data._id.toString(),
    };
  } catch (error) {
    return { message: 'Token inválido ou expirado', isAuthenticated: false };
  }
};
