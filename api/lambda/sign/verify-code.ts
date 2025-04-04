import { useContext } from '@modern-js/runtime/express';
import jwt from 'jsonwebtoken';
import { User, connectDB } from '../../models';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

if (!process.env.JWT_SECRET) {
  console.warn(
    'WARNING: JWT_SECRET environment variable is not set. Using fallback secret. This is insecure for production.',
  );
}

export const post = async () => {
  const { req, res } = useContext();
  await connectDB();
  const { email, code } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.verificationCode !== String(code)) {
    return res.status(400).json({ message: 'Código de verificação inválido' });
  }

  if (user.codeExpiration && user.codeExpiration < new Date()) {
    return res.status(400).json({ message: 'Código de verificação expirado' });
  }

  // Limpa o código de verificação e sua expiração
  user.verificationCode = undefined;
  user.codeExpiration = undefined;
  await user.save();

  // Gera o token JWT - expira em 2 semanas
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: '14d',
  });

  // Define o cookie de sessão com duração de 2 semanas
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 14 * 24 * 60 * 60 * 1000, // 2 semanas em milissegundos
    sameSite: 'strict',
  });

  return res.status(200).json({ message: 'Autenticação bem-sucedida', token });
};
