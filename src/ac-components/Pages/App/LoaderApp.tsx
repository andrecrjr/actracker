import { cookieUtils } from '@/ac-components/utils';
import { type LoaderFunction, json } from '@modern-js/runtime/router';

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get('Cookie');

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieUtils(cookieHeader);
  const token = cookies['token'];

  return json({ userAuth: !!token && !token.includes('deleted') });
};
