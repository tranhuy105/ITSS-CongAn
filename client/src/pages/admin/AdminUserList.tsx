import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Lock, Unlock, Search, UserCog, Shield, User, Plus, Edit } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getUsersAdmin,
  updateUserRole,
  toggleUserLock,
} from '@/services/userService';
import { useNavigate } from 'react-router-dom';
import { LanguageToggle } from '@/components/LanguageToggle';
// Định nghĩa kiểu dữ liệu trả về từ service
interface UserAdmin {
  _id: string;
  name: string;
  email: string;
  role: 'guest' | 'admin';
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export const AdminUserList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [lockFilter, setLockFilter] = useState<string>('');
  const usersPerPage = 10;

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['adminUsers', page, search, roleFilter, lockFilter],
    queryFn: () =>
      getUsersAdmin({
        page,
        limit: usersPerPage,
        search,
        role: roleFilter || undefined,
        isLocked: lockFilter || undefined,
      }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'guest' | 'admin' }) =>
      updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  const toggleLockMutation = useMutation({
    mutationFn: toggleUserLock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });


  const handleToggleLock = (id: string, name: string, isLocked: boolean) => {
    const action = isLocked ? t('adminPages.users.verbs.unlock') : t('adminPages.users.verbs.lock');
    if (
      window.confirm(
        t('adminPages.users.confirm.toggleLock', { action, name })
      )
    ) {
      toggleLockMutation.mutate(id);
    }
  };

  const handleUpdateRole = (id: string, name: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'guest' : 'admin';
    const roleText = t(`adminPages.users.roleNames.${newRole}`);
    if (
      window.confirm(
        t('adminPages.users.confirm.changeRole', { name, role: roleText })
      )
    ) {
      updateRoleMutation.mutate({ id, role: newRole });
    }
  };

  const totalPages = data?.pagination?.totalPages || 1;
  const isMutating =
    updateRoleMutation.isPending || toggleLockMutation.isPending;

  return (
    <AdminLayout title={t('admin.users')}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {t('admin.users')} ({data?.pagination.total || 0})
        </h1>

        <Button onClick={() => navigate('/admin/users/new')}>
          <Plus className="w-4 h-4 mr-2" />
          {t('adminPages.users.createNew')}
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('adminPages.users.searchPlaceholder')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 w-full h-10 border rounded-md text-sm bg-background focus:ring-1 focus:ring-primary"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 border rounded-md text-sm bg-background focus:ring-1 focus:ring-primary"
            >
              <option value="">{t('adminPages.users.filters.allRoles')}</option>
              <option value="guest">{t('adminPages.users.filters.roleGuest')}</option>
              <option value="admin">{t('adminPages.users.filters.roleAdmin')}</option>
            </select>

            <select
              value={lockFilter}
              onChange={(e) => {
                setLockFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 border rounded-md text-sm bg-background focus:ring-1 focus:ring-primary"
            >
              <option value="">{t('adminPages.users.filters.allStatuses')}</option>
              <option value="false">{t('adminPages.users.filters.statusActive')}</option>
              <option value="true">{t('adminPages.users.filters.statusLocked')}</option>
            </select>

            {isFetching && <Skeleton className="h-4 w-12" />}
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[20%]">{t('adminPages.users.table.name')}</TableHead>
                  <TableHead className="w-[25%]">{t('adminPages.users.table.email')}</TableHead>
                  <TableHead className="w-[15%]">{t('adminPages.users.table.role')}</TableHead>
                  <TableHead className="w-[15%]">{t('adminPages.users.table.status')}</TableHead>
                  <TableHead className="w-[15%]">{t('adminPages.users.table.createdAt')}</TableHead>
                  <TableHead className="text-right w-[10%]">
                    {t('adminPages.users.table.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || isError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {isLoading ? t('common.loadingData') : t('common.loadError')}
                    </TableCell>
                  </TableRow>
                ) : data?.users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {t('adminPages.users.messages.noResults')}
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.users.map((user: UserAdmin) => (
                    <TableRow
                      key={user._id}
                      className={
                        user.isLocked
                          ? 'bg-red-50/50 text-muted-foreground hover:bg-red-50/70'
                          : ''
                      }
                    >
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-sm">{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role === 'admin' ? 'default' : 'secondary'}
                          className="flex items-center gap-1 w-fit"
                        >
                          {user.role === 'admin' ? (
                            <>
                              <Shield className="w-3 h-3" /> {t('adminPages.users.badges.admin')}
                            </>
                          ) : (
                            <>
                              <User className="w-3 h-3" /> {t('adminPages.users.badges.guest')}
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isLocked ? (
                          <span className="text-red-600 font-medium flex items-center gap-1">
                            <Lock className="w-4 h-4" /> {t('adminPages.users.filters.statusLocked')}
                          </span>
                        ) : (
                          <span className="text-green-600 flex items-center gap-1">
                            <Unlock className="w-4 h-4" /> {t('adminPages.users.filters.statusActive')}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(user.createdAt).toLocaleDateString(
                          i18n.language === 'vi' ? 'vi-VN' : 'ja-JP'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isMutating}
                            onClick={() => navigate(`/admin/users/edit/${user._id}`)}
                            title={t('adminPages.users.actions.edit')}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isMutating}
                            onClick={() =>
                              handleUpdateRole(user._id, user.name, user.role)
                            }
                            title={t('adminPages.users.actions.changeRole')}
                          >
                            <UserCog className="w-4 h-4" />
                          </Button>
                          <Button
                            variant={user.isLocked ? 'success' : 'destructive'}
                            size="sm"
                            disabled={isMutating}
                            onClick={() =>
                              handleToggleLock(user._id, user.name, user.isLocked)
                            }
                            title={
                              user.isLocked
                                ? t('adminPages.users.actions.unlockAccount')
                                : t('adminPages.users.actions.lockAccount')
                            }
                          >
                            {user.isLocked ? (
                              <Unlock className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isFetching}
              >
                {t('common.previous')}
              </Button>
              <span className="text-sm">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages || isFetching}
              >
                {t('common.next')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="fixed bottom-6 right-6 z-50 shadow-sm">
        <LanguageToggle />
      </div>
    </AdminLayout>
  );
};
