import { useContext } from '@modern-js/runtime/express';

export const get = async () => {
  const { req } = useContext();
  console.info(`access url: ${req.url}`);
  return 'Hello Modern.js';
};
