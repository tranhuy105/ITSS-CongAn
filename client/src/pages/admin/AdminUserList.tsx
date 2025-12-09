import { AdminLayout } from '@/components/admin/AdminLayout';
import { useTranslation } from 'react-i18next';

export const AdminUserList = () => {
  const { t } = useTranslation();

  return (
    <AdminLayout title={t('admin.users')}>
      <h1 className="text-2xl font-bold mb-6">{t('admin.users')}</h1>
      <p className="text-muted-foreground">
        Quản lý danh sách người dùng (khóa/mở tài khoản, thay đổi vai trò).
      </p>
    </AdminLayout>
  );
};
