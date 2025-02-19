import { useFetcher, useNavigate, useSubmit } from '@modern-js/runtime/router';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';

export default function PasswordlessLogin() {
  const fetcher = useFetcher();
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const nav = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'email') {
      setEmail(e.target.value);
    } else {
      setCode(e.target.value);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const authFormData = new FormData();

    if (step === 'email' && email) {
      authFormData.append('email', email);
      authFormData.append('intent', 'send-code');
      fetcher.submit(authFormData, { method: 'POST' });
      setStep('verify');
    } else {
      authFormData.append('email', email);
      authFormData.append('code', code);
      authFormData.append('intent', 'validate-code');
      fetcher.submit(authFormData, { method: 'POST' });
    }
  };

  useEffect(() => {
    if (fetcher.data?.error) {
      setError(fetcher.data.error);
    }
    if (fetcher.data?.success) {
      // need to do that because we put cookies into user side
      window.location.href = '/app';
    }
  }, [fetcher]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-semibold text-center">
          {step === 'email' ? 'Sign in' : 'Verify Code in your e-mail'}
        </h2>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {step === 'email' ? (
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Digite seu e-mail"
              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          ) : (
            <input
              type="text"
              name="code"
              value={code}
              onChange={handleChange}
              placeholder="Digite o código"
              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              maxLength={6}
            />
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600 disabled:opacity-50"
          >
            {loading
              ? 'Carregando...'
              : step === 'email'
                ? 'Send Code'
                : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  );
}
