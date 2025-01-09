import { useContext } from '@modern-js/runtime/express';
import jwt from 'jsonwebtoken';
import { User, connectDB } from '../../models';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

export const post = async () => {
  const { req, res } = useContext();
  const { email, verificationCode } = req.body;

  await connectDB();

  const user = await User.findOne({ email });

  if (!user || user.verificationCode !== verificationCode) {
    return res.status(400).json({ message: 'Código de verificação inválido' });
  }

  if (user.codeExpiration && user.codeExpiration < new Date()) {
    return res.status(400).json({ message: 'Código de verificação expirado' });
  }

  user.verificationCode = undefined;
  user.codeExpiration = undefined;
  await user.save();

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

  return res.status(200).json({ token });
};
