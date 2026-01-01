import { Alert } from '@/components/Alert';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';
import { Label } from '@radix-ui/react-label';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const ForgotPasswordPage = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const validateEmail = (email: string) => email.includes('@');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!email) {
            setError(t('validation.emailRequired'));
            return;
        }

        if (!validateEmail(email)) {
            setError(t('validation.invalidEmail'));
            return;
        }

        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setSuccess(true);
            setEmail('');
        } catch (err: unknown) {
            type ApiError = { response?: { data?: { error?: { message?: string } } } };
            const apiErr = err as ApiError;
            setError(apiErr.response?.data?.error?.message || t('auth.errors.resetLinkFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title={t('auth.resetPassword')}>
            <p className="text-sm text-gray-600 text-center mb-4">
                {t('auth.resetDescription')}
            </p>

            {error && <Alert type="error" message={error} />}
            {success && <Alert type="success" message={t('messages.resetLinkSent')} />}

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

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t('common.loading') : t('auth.sendResetLink')}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <Link
                    to="/login"
                    className="text-sm font-medium text-gray-900 hover:underline"
                >
                    {t('auth.backToLogin')}
                </Link>
            </div>
        </AuthLayout>
    );
};
