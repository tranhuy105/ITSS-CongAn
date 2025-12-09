import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();

  return (
    <AdminLayout title={t('admin.dashboard')}>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{t('admin.welcomeMessage')}</h2>

        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">{t('admin.dashboardDescription')}</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};
