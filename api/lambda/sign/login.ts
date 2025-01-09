import crypto from 'crypto';
import { useContext } from '@modern-js/runtime/express';
import { User, connectDB } from '../../models';

export const get = async () => {
  const { req, res } = useContext();
  try {
    const data = await User.findOne();
    console.log(data);
    return res.json({ error: 'Not found' }).status(404);
  } catch (error) {
    console.log('No users');
    return res.json({ error: 'Not found' }).status(404);
  }
};

export const post = async () => {
  const { req, res } = useContext();
  await connectDB();
  const { email } = req.body;
  // Gera um código de verificação de 6 dígitos
  const verificationCode = crypto.randomInt(100000, 999999).toString();
  const codeExpiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

  let user = await User.findOne({ email });

  if (user) {
    user.verificationCode = verificationCode;
    user.codeExpiration = codeExpiration;
  } else {
    user = new User({
      email,
      verificationCode,
      codeExpiration,
    });
  }

  await user.save();
  //await sendVerificationCode(email, verificationCode);

  return res.json({ message: true, codeExpiration }).status(200);
};
