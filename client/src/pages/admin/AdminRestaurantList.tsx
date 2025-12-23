import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Plus, Trash2, RotateCcw, Search, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getRestaurantsAdmin,
  deleteRestaurant,
  restoreRestaurant,
} from '@/services/restaurantService';
import { NavLink, useNavigate } from 'react-router-dom';
import { LanguageToggle } from '@/components/LanguageToggle';

// Định nghĩa kiểu dữ liệu trả về từ service
interface RestaurantAdmin {
  _id: string;
  name: string;
  address: string;
  averageRating: number;
  reviewCount: number;
  deletedAt: string | null;
}

export const AdminRestaurantList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const restaurantsPerPage = 10;

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['adminRestaurants', page, search],
    queryFn: () => getRestaurantsAdmin({ page, limit: restaurantsPerPage, search }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRestaurant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRestaurants'] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreRestaurant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminRestaurants'] });
    },
  });

  const handleSoftDelete = (id: string, name: string) => {
    if (window.confirm(t('adminPages.restaurants.confirm.softDelete', { name }))) {
      deleteMutation.mutate(id);
    }
  };

  const handleRestore = (id: string, name: string) => {
    if (window.confirm(t('adminPages.restaurants.confirm.restore', { name }))) {
      restoreMutation.mutate(id);
    }
  };

  const totalPages = data?.pagination?.totalPages || 1;
  const isMutating = deleteMutation.isPending || restoreMutation.isPending;

  return (
    <AdminLayout title={t('admin.restaurants')}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {t('admin.restaurants')} ({data?.pagination.total || 0})
        </h1>

        <Button onClick={() => navigate('/admin/restaurants/new')}>
          <Plus className="w-4 h-4 mr-2" />
          {t('adminPages.restaurants.createNew')}
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('adminPages.restaurants.searchPlaceholder')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 w-full h-10 border rounded-md text-sm bg-background focus:ring-1 focus:ring-primary"
              />
            </div>
            {isFetching && <Skeleton className="h-4 w-12" />}
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">{t('adminPages.restaurants.table.name')}</TableHead>
                  <TableHead className="w-[30%]">{t('adminPages.restaurants.table.address')}</TableHead>
                  <TableHead className="w-[10%]">{t('adminPages.restaurants.table.rating')}</TableHead>
                  <TableHead className="w-[15%]">{t('adminPages.restaurants.table.status')}</TableHead>
                  <TableHead className="text-right w-[20%]">{t('adminPages.restaurants.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || isError ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {isLoading ? t('common.loadingData') : t('common.loadError')}
                    </TableCell>
                  </TableRow>
                ) : data?.restaurants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {t('adminPages.restaurants.messages.noResults')}
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.restaurants.map((restaurant: RestaurantAdmin) => (
                    <TableRow
                      key={restaurant._id}
                      className={
                        restaurant.deletedAt
                          ? 'bg-red-50/50 text-muted-foreground hover:bg-red-50/70'
                          : ''
                      }
                    >
                      <TableCell className="font-medium">{restaurant.name}</TableCell>
                      <TableCell className="text-xs">{restaurant.address}</TableCell>
                      <TableCell>
                        {restaurant.averageRating?.toFixed(1)} ({restaurant.reviewCount})
                      </TableCell>
                      <TableCell>
                        {restaurant.deletedAt ? (
                          <span className="text-red-600 font-medium">
                            {t('adminPages.restaurants.status.deleted')}
                          </span>
                        ) : (
                          <span className="text-green-600">{t('adminPages.restaurants.status.active')}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button variant="ghost" size="icon-sm" asChild>
                          <NavLink
                            to={`/restaurants/${restaurant._id}`}
                            target="_blank"
                            title={t('adminPages.restaurants.actions.viewPublic')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </NavLink>
                        </Button>

                        {restaurant.deletedAt ? (
                          <Button
                            variant="success"
                            size="sm"
                            disabled={isMutating}
                            onClick={() => handleRestore(restaurant._id, restaurant.name)}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" /> {t('adminPages.restaurants.actions.restore')}
                          </Button>
                        ) : (
                          <>
                            <Button variant="outline" size="icon-sm" asChild>
                              <NavLink
                                to={`/admin/restaurants/edit/${restaurant._id}`}
                                title={t('adminPages.restaurants.actions.edit')}
                              >
                                <Edit className="w-4 h-4" />
                              </NavLink>
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon-sm"
                              disabled={isMutating}
                              onClick={() => handleSoftDelete(restaurant._id, restaurant.name)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
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
