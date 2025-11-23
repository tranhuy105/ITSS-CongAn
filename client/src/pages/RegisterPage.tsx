import { Alert } from '@/components/Alert';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Label } from '@radix-ui/react-label';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

export const RegisterPage = () => {
    const { t } = useTranslation();
    const { register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validateEmail = (email: string) => email.includes('@');

    const validatePassword = (password: string) => {
        if (password.length < 6) {
            return { valid: false, message: t('validation.passwordMinLength') };
        }

        let criteriaCount = 0;
        if (/[a-zA-Z]/.test(password)) criteriaCount++;
        if (/\d/.test(password)) criteriaCount++;
        if (/[!@#$%^&*()_+\-=\[\]{};:,.<>?/\\|`~]/.test(password)) criteriaCount++;

        if (criteriaCount < 2) {
            return { valid: false, message: t('validation.passwordWeak') };
        }

        return { valid: true };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name) {
            setError(t('validation.nameRequired'));
            return;
        }

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

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            setError(passwordValidation.message || '');
            return;
        }

        setLoading(true);

        try {
            await register({ name, email, password });
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title={t('auth.register')}>
            {error && <Alert type="error" message={error} />}

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <Label htmlFor="name">{t('auth.name')}</Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

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
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Loading...' : t('auth.registerButton')}
                </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
                {t('auth.hasAccount')}{' '}
                <Link to="/login" className="font-medium text-gray-900 hover:underline">
                    {t('auth.login')}
                </Link>
            </div>
        </AuthLayout>
    );
};
