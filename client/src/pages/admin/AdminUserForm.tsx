import { AdminLayout } from '@/components/admin/AdminLayout';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  createUserAdmin,
  deleteUserAdmin,
  getUserByIdAdmin,
  updateUserAdmin,
} from '@/services/userService';
import {
  createUserClientSchema,
  updateUserClientSchema,
  type CreateUserClientPayload,
  type UpdateUserClientPayload,
} from '@/validators/user.client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const AdminUserForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = useMemo(() => !!id, [id]);

  const [formData, setFormData] = useState<CreateUserClientPayload>({
    name: '',
    email: '',
    password: '',
    role: 'guest',
    isLocked: false,
  });
  const [formError, setFormError] = useState('');

  const pageTitle = useMemo(() => {
    if (isEdit) return t('adminPages.users.form.editTitle');
    return t('adminPages.users.createNew');
  }, [t, isEdit]);

  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['adminUser', id],
    queryFn: () => getUserByIdAdmin(id!),
    enabled: isEdit && !!id,
  });

  useEffect(() => {
    if (!isEdit || !userData) return;
    setFormData((prev) => ({
      ...prev,
      name: userData.name ?? '',
      email: userData.email ?? '',
      password: '', // keep blank unless admin wants to reset
      role: userData.role ?? 'guest',
      isLocked: !!userData.isLocked,
    }));
  }, [isEdit, userData]);

  const submitMutation = useMutation({
    mutationFn: (data: CreateUserClientPayload | UpdateUserClientPayload) => {
      if (isEdit) {
        const payload = data as UpdateUserClientPayload;
        const updatePayload: {
          name: string;
          email: string;
          role: 'guest' | 'admin';
          isLocked: boolean;
          password?: string;
        } = {
          name: payload.name,
          email: payload.email,
          role: payload.role,
          isLocked: payload.isLocked,
        };
        if (payload.password && payload.password.trim().length > 0) {
          updatePayload.password = payload.password;
        }
        return updateUserAdmin(id!, updatePayload);
      }
      return createUserAdmin(data as CreateUserClientPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      alert(
        isEdit
          ? t('adminPages.users.form.successUpdated', { name: formData.name })
          : t('adminPages.users.form.successCreated', { name: formData.name })
      );
      navigate('/admin/users');
    },
    onError: (err: unknown) => {
      const e = err as {
        response?: {
          data?: {
            error?: {
              message?: string;
              details?: Array<{ field?: string; message?: string }>;
            };
          };
        };
      };

      const detailsMsg =
        e.response?.data?.error?.details
          ?.map((d) => `${d.field ?? ''}: ${d.message ?? ''}`.trim())
          .filter(Boolean)
          .join('; ') || '';

      const msg =
        detailsMsg ||
        e.response?.data?.error?.message ||
        t('adminPages.forms.genericProcessError');
      setFormError(t('adminPages.forms.systemValidationError', { msg }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUserAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      navigate('/admin/users');
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      const msg = e.response?.data?.error?.message || t('adminPages.forms.genericProcessError');
      setFormError(t('adminPages.forms.systemValidationError', { msg }));
    },
  });

  const isSubmitting = submitMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const isLoading = isSubmitting || isDeleting || (isEdit && isUserLoading);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const parsed = (isEdit ? updateUserClientSchema : createUserClientSchema).safeParse(formData);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      setFormError(t('adminPages.forms.systemValidationError', { msg }));
      return;
    }

    submitMutation.mutate(parsed.data);
  };

  return (
    <AdminLayout title={pageTitle}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{pageTitle}</h1>

        {isEdit && (
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={() => {
              if (!id) return;
              if (window.confirm(t('adminPages.users.confirm.delete', { name: formData.name }))) {
                deleteMutation.mutate(id);
              }
            }}
            title={t('adminPages.users.actions.delete')}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('adminPages.users.actions.delete')}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('adminPages.users.form.basicInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          {formError && <Alert type="error" message={formError} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('adminPages.users.form.name')}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder={t('adminPages.users.form.namePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('adminPages.users.form.email')}</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  placeholder={t('adminPages.users.form.emailPlaceholder')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('adminPages.users.form.password')}</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  placeholder={
                    isEdit
                      ? t('adminPages.users.form.passwordPlaceholderEdit')
                      : t('adminPages.users.form.passwordPlaceholder')
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>{t('adminPages.users.form.role')}</Label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, role: e.target.value as 'guest' | 'admin' }))
                  }
                  className="h-10 px-3 border rounded-md text-sm bg-background focus:ring-1 focus:ring-primary w-full"
                >
                  <option value="guest">{t('adminPages.users.filters.roleGuest')}</option>
                  <option value="admin">{t('adminPages.users.filters.roleAdmin')}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input
                id="isLocked"
                type="checkbox"
                checked={formData.isLocked}
                onChange={(e) => setFormData((p) => ({ ...p, isLocked: e.target.checked }))}
                className="h-4 w-4"
              />
              <Label htmlFor="isLocked">{t('adminPages.users.form.isLocked')}</Label>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="submit" disabled={isLoading}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEdit ? t('adminPages.users.form.updating') : t('adminPages.users.form.creating')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEdit ? t('adminPages.users.form.update') : t('adminPages.users.form.create')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};


