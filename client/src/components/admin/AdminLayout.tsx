import { ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AdminSidebar } from './AdminSidebar';
import { useTranslation } from 'react-i18next';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 bg-card border-b h-16 flex items-center justify-between px-6 shadow-sm">
          <h1 className="text-xl font-bold">{title}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {t('common.welcome')},{' '}
              <span className="font-semibold text-foreground">{user?.name}</span>
            </span>
            <Button variant="ghost" onClick={handleLogout} title={t('common.logout')}>
              <LogOut className="w-5 h-5 mr-2" />
              {t('common.logout')}
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6 bg-muted/40">{children}</main>
      </div>
    </div>
  );
};
