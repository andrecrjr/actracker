import { useContext } from '@modern-js/runtime/express';
import jwt from 'jsonwebtoken';
import { User, connectDB } from '../../models';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const post = async () => {
  const { req, res } = useContext();
  await connectDB();
  const { email, verificationCode } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.verificationCode !== verificationCode) {
    return res.status(400).json({ message: 'Código de verificação inválido' });
  }

  if (user.codeExpiration && user.codeExpiration < new Date()) {
    return res.status(400).json({ message: 'Código de verificação expirado' });
  }

  // Limpa o código de verificação e sua expiração
  user.verificationCode = undefined;
  user.codeExpiration = undefined;
  await user.save();

  // Gera o token JWT
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1y' });

  // Define o cookie de sessão com duração de 1 ano
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 ano em milissegundos
  });

  res.status(200).json({ message: 'Autenticação bem-sucedida' });
};
