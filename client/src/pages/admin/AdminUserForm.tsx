import { AdminLayout } from '@/components/admin/AdminLayout';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  deleteUserAdmin,
  getUserByIdAdmin,
  toggleUserLock,
} from '@/services/userService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Trash2, Lock, Unlock, Shield, User } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const AdminUserForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formError, setFormError] = useState('');

  const pageTitle = useMemo(() => {
    return t('adminPages.users.form.viewTitle') || 'Chi tiết người dùng';
  }, [t]);

  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['adminUser', id],
    queryFn: () => getUserByIdAdmin(id!),
    enabled: !!id,
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
      setFormError(msg);
    },
  });

  const toggleLockMutation = useMutation({
    mutationFn: toggleUserLock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminUser', id] });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      const msg = e.response?.data?.error?.message || t('adminPages.forms.genericProcessError');
      setFormError(msg);
    },
  });

  const isDeleting = deleteMutation.isPending;
  const isTogglingLock = toggleLockMutation.isPending;
  const isLoading = isDeleting || isTogglingLock || isUserLoading;

  const handleDelete = () => {
    if (!id || !userData) return;
    if (window.confirm(t('adminPages.users.confirm.delete', { name: userData.name }))) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleLock = () => {
    if (!id || !userData) return;
    const action = userData.isLocked 
      ? t('adminPages.users.verbs.unlock') 
      : t('adminPages.users.verbs.lock');
    if (
      window.confirm(
        t('adminPages.users.confirm.toggleLock', { action, name: userData.name })
      )
    ) {
      toggleLockMutation.mutate(id);
    }
  };

  if (isUserLoading) {
    return (
      <AdminLayout title={pageTitle}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!userData) {
    return (
      <AdminLayout title={pageTitle}>
        <Card>
          <CardContent className="p-6">
            <Alert type="error" message={t('adminPages.users.messages.notFound') || 'Không tìm thấy người dùng'} />
            <Button onClick={() => navigate('/admin/users')} className="mt-4">
              {t('common.back')}
            </Button>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={pageTitle}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{pageTitle}</h1>

        <div className="flex gap-3">
          <Button
            variant={userData.isLocked ? 'default' : 'destructive'}
            disabled={isLoading}
            onClick={handleToggleLock}
            title={
              userData.isLocked
                ? t('adminPages.users.actions.unlockAccount')
                : t('adminPages.users.actions.lockAccount')
            }
          >
            {isTogglingLock ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('common.loading')}
              </>
            ) : userData.isLocked ? (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                {t('adminPages.users.actions.unlockAccount')}
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                {t('adminPages.users.actions.lockAccount')}
              </>
            )}
          </Button>

          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={handleDelete}
            title={t('adminPages.users.actions.delete')}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('adminPages.users.actions.delete')}
          </Button>
        </div>
      </div>

      {formError && (
        <div className="mb-6">
          <Alert type="error" message={formError} />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('adminPages.users.form.basicInfo')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {t('adminPages.users.form.name')}
                </label>
                <div className="p-3 border rounded-md bg-muted/50 text-sm">
                  {userData.name}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {t('adminPages.users.form.email')}
                </label>
                <div className="p-3 border rounded-md bg-muted/50 text-sm">
                  {userData.email}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {t('adminPages.users.table.role')}
                </label>
                <div className="p-3">
                  <Badge
                    variant={userData.role === 'admin' ? 'default' : 'secondary'}
                    className="flex items-center gap-1 w-fit"
                  >
                    {userData.role === 'admin' ? (
                      <>
                        <Shield className="w-3 h-3" /> {t('adminPages.users.badges.admin')}
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3" /> {t('adminPages.users.badges.guest')}
                      </>
                    )}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {t('adminPages.users.table.status')}
                </label>
                <div className="p-3">
                  {userData.isLocked ? (
                    <span className="text-red-600 font-medium flex items-center gap-1">
                      <Lock className="w-4 h-4" /> {t('adminPages.users.filters.statusLocked')}
                    </span>
                  ) : (
                    <span className="text-green-600 flex items-center gap-1">
                      <Unlock className="w-4 h-4" /> {t('adminPages.users.filters.statusActive')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  {t('adminPages.users.table.createdAt')}
                </label>
                <div className="p-3 border rounded-md bg-muted/50 text-sm">
                  {new Date(userData.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Cập nhật lần cuối
                </label>
                <div className="p-3 border rounded-md bg-muted/50 text-sm">
                  {new Date(userData.updatedAt).toLocaleString('vi-VN')}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button variant="outline" onClick={() => navigate('/admin/users')}>
              {t('common.back')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};


