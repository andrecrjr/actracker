import crypto from 'crypto';
import { User, connectDB } from '@api/models';
import { useContext } from '@modern-js/runtime/express';

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
  try {
    const { email } = req.body;
    console.log(email);

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const codeExpiration = new Date(Date.now() + 60 * 60 * 60 * 1000);

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
    console.log(user);

    await user.save();
    //await sendVerificationCode(email, verificationCode);

    return res.json({ message: true, codeExpiration }).status(200);
  } catch (error) {
    return res.json({ success: false }).status(403);
  }
};
