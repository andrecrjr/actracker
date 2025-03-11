import { cookieUtils } from '@/ac-components/utils';
import { type LoaderFunction, json } from '@modern-js/runtime/router';

export const loader: LoaderFunction = async ({ request }) => {
  return json({ test: 'wow' });
};
