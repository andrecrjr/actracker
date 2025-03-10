import { log } from 'console';
import { cookieUtils } from '@/ac-components/utils';
import { type LoaderFunction, redirect } from '@modern-js/runtime/router';

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get('Cookie');

  if (!cookieHeader) {
    return null;
  }
  const cookies = cookieUtils(cookieHeader);
  const token = cookies['token'];
  if (token) {
    console.log(token);
    const headers = new Headers();
    headers.append(
      'Set-Cookie',
      `token=deleted; HttpOnly; Path=/; Max-Age=${60}`,
    );
    console.log(request);
    // return redirect('/', { headers });
    return redirect(
      `${process.env.NODE_ENV ? 'http://' : 'https://'}${request.headers.get('host')}`,
      { headers },
    );
  }

  return null;
};
