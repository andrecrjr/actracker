import { cookieUtils } from '@/ac-components/utils';
import {
  type ActionFunction,
  type LoaderFunction,
  json,
  redirect,
} from '@modern-js/runtime/router';

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get('Cookie');

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieUtils(cookieHeader);
  const token = cookies['token'];
  if (token) {
    return redirect('/');
  }

  return null;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const apiUrl = new URL(request.url)?.origin;

  const intent = formData.get('intent')?.toString();
  const email = formData.get('email')?.toString();
  const code = formData.get('code')?.toString();

  if (!email) {
    return { error: 'Email é obrigatório' };
  }

  if (intent === 'send-code') {
    const response = await fetch(`${apiUrl}/api/sign/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      return { error: 'Falha ao enviar o código de verificação' };
    }

    return { message: 'Código de verificação enviado' };
  } else if (intent === 'validate-code' && code) {
    const response = await fetch(`${apiUrl}/api/sign/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
      return { error: 'Código de verificação inválido ou expirado' };
    }

    const { token } = await response.json();

    const headers = new Headers();
    headers.append(
      'Set-Cookie',
      `token=${token}; HttpOnly; Path=/; Max-Age=${365 * 24 * 60 * 60}`,
    );

    return json({ success: true, token }, { headers });
  } else {
    return { error: 'Dados inválidos' };
  }
};
