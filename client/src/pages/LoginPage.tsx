import { Alert } from '@/components/Alert';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Label } from '@radix-ui/react-label';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

export const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => email.includes('@');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError(t('validation.emailRequired'));
      return;
    }

    if (!validateEmail(email)) {
      setError(t('validation.invalidEmail'));
      return;
    }

    if (!password) {
      setError(t('validation.passwordRequired'));
      return;
    }

    setLoading(true);

    try {
      const authResponse = await login({ email, password });
      if (authResponse.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        // Guest -> check callback
        const redirectUrl = searchParams.get('redirect');
        navigate(redirectUrl || '/', { replace: true });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error?.message || t('auth.errors.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={t('auth.login')}>
      {error && <Alert type="error" message={error} />}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-gray-900 hover:underline">
            {t('auth.forgotPassword')}
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? t('common.loading') : t('auth.loginButton')}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="font-medium text-gray-900 hover:underline">
          {t('auth.register')}
        </Link>
      </div>
    </AuthLayout>
  );
};
