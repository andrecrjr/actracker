import crypto from 'crypto';
import { sendEmail } from '@/ac-components/utils/backend-utils';
// api/lambda/register.ts
import { useContext } from '@modern-js/runtime/express';
import { User, connectDB } from '../../models';

export const post = async () => {
  const { req, res } = useContext();
  await connectDB();
  const { email } = JSON.parse(req.body);

  const verificationCode = crypto.randomInt(100000, 999999).toString();
  const codeExpiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
  console.log(verificationCode);

  let user = await User.findOne({ email });
  if (user) {
    user.verificationCode = verificationCode;
    user.codeExpiration = codeExpiration;
  } else {
    user = new User({ email, verificationCode, codeExpiration });
  }
  await user.save();
  const htmlContent = `<p>Seu código de verificação é: <strong>${verificationCode}</strong></p>`;

  // await sendEmail(email, 'ACTracker Sign In Code', htmlContent); // Envia o e-mail com o código

  res.status(200).json({ message: 'Código de verificação enviado' });
};
