import { useNavigate } from '@modern-js/runtime/router';
import axios from 'axios';
import { useState } from 'react';

export default function PasswordlessLogin() {
  const [formData, setFormData] = useState({ email: '', code: '' });
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  console.log(formData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (step === 'email') {
        await axios.post('/api/sign/login', { email: formData.email });
        setStep('verify');
      } else {
        const response = await axios.post('/api/sign/verify-code', formData);
        document.cookie = `token=${response.data.token}; path=/; max-age=${365 * 24 * 60 * 60}`;
        navigation('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Algo deu errado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-2xl font-semibold text-center">
          {step === 'email' ? 'Entrar' : 'Verificar Código'}
        </h2>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 'email' ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Digite seu e-mail"
              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          ) : (
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Digite o código"
              className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
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
                ? 'Enviar Código'
                : 'Verificar'}
          </button>
        </form>
      </div>
    </div>
  );
}
