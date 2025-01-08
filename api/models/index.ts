import { useContext } from '@modern-js/runtime/express';

export const get = async () => {
  const { req, res } = useContext();

  return res.json({ models: true }).status(200);
};
