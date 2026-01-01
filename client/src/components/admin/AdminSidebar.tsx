import { ChefHat, LayoutDashboard, Utensils, Users } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export const AdminSidebar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems: NavItem[] = [
    { name: t('admin.dashboard'), href: '/admin', icon: LayoutDashboard },
    { name: t('admin.dishes'), href: '/admin/dishes', icon: ChefHat },
    { name: t('admin.restaurants'), href: '/admin/restaurants', icon: Utensils },
    { name: t('admin.users'), href: '/admin/users', icon: Users },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground border-r shrink-0">
      <div className="p-4 flex items-center justify-center border-b">
        <h2 className="text-xl font-bold text-primary">Admin Panel</h2>
      </div>

      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center p-3 rounded-lg transition-colors gap-3',
                active
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-md'
                  : 'hover:bg-sidebar-accent'
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
