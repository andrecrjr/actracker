import { useContext } from '@modern-js/runtime/express';

export const get = async () => {
  const { req, res } = useContext();
  console.log(req);
  return res.json({ ok: true }).status(200);
};
