import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Plus, Trash2, RotateCcw, Search, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDishesAdmin, deleteDish, restoreDish } from '@/services/dishService';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DishDetailModal } from '@/components/admin/DishDetailModal';

// Định nghĩa kiểu dữ liệu trả về từ service
interface DishAdmin {
  _id: string;
  name: { vi: string; ja: string };
  category: string;
  region: string;
  averageRating: number;
  deletedAt: string | null;
}

export const AdminDishList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const language = i18n.language as 'ja' | 'vi';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const dishesPerPage = 10;

  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);

  // --- Data Fetching ---
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['adminDishes', page, search],
    queryFn: () => getDishesAdmin({ page, limit: dishesPerPage, search }),
  });

  // --- Mutations ---

  const deleteMutation = useMutation({
    mutationFn: deleteDish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDishes'] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreDish,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDishes'] });
    },
  });

  // --- Handlers ---

  const handleSoftDelete = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa mềm món ăn "${name}" không?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleRestore = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn khôi phục món ăn "${name}" không?`)) {
      restoreMutation.mutate(id);
    }
  };

  const totalPages = data?.pagination?.totalPages || 1;
  const isMutating = deleteMutation.isPending || restoreMutation.isPending;

  return (
    <AdminLayout title={t('admin.dishes')}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {t('admin.dishes')} ({data?.pagination.total || 0})
        </h1>

        {/* Button Create New Dish (Tạm thời navigate đến /admin/dishes/new) */}
        <Button onClick={() => navigate('/admin/dishes/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo Món Ăn Mới
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
                placeholder="Tìm kiếm theo tên..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // Reset page on search
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
                  <TableHead className="w-[30%]">Tên Món Ăn</TableHead>
                  <TableHead className="w-[15%]">Danh Mục</TableHead>
                  <TableHead className="w-[10%]">Vùng Miền</TableHead>
                  <TableHead className="w-[10%]">Đánh Giá</TableHead>
                  <TableHead className="w-[15%]">Trạng Thái</TableHead>
                  <TableHead className="text-right w-[20%]">Hành Động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading || isError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {isLoading ? 'Đang tải dữ liệu...' : 'Lỗi tải dữ liệu'}
                    </TableCell>
                  </TableRow>
                ) : data?.dishes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Không tìm thấy món ăn nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.dishes.map((dish: DishAdmin) => (
                    <TableRow
                      key={dish._id}
                      className={
                        dish.deletedAt
                          ? 'bg-red-50/50 text-muted-foreground hover:bg-red-50/70'
                          : ''
                      }
                    >
                      <TableCell className="font-medium">{dish.name[language]}</TableCell>
                      <TableCell>{dish.category}</TableCell>
                      <TableCell>{dish.region}</TableCell>
                      <TableCell>{dish.averageRating}</TableCell>
                      <TableCell>
                        {dish.deletedAt ? (
                          <span className="text-red-600 font-medium">Đã Xóa</span>
                        ) : (
                          <span className="text-green-600">Hoạt Động</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        {/* Nút Xem Chi Tiết */}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setSelectedDishId(dish._id)}
                          title="Xem chi tiết (Admin)"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>

                        {dish.deletedAt ? (
                          // Nút Khôi Phục
                          <Button
                            variant="success"
                            size="sm"
                            disabled={isMutating}
                            onClick={() => handleRestore(dish._id, dish.name[language])}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Khôi Phục
                          </Button>
                        ) : (
                          <>
                            {/* Nút Sửa */}
                            <Button variant="outline" size="icon-sm" asChild>
                              <NavLink to={`/admin/dishes/edit/${dish._id}`} title="Chỉnh sửa">
                                <Edit className="w-4 h-4" />
                              </NavLink>
                            </Button>
                            {/* Nút Xóa Mềm */}
                            <Button
                              variant="destructive"
                              size="icon-sm"
                              disabled={isMutating}
                              onClick={() => handleSoftDelete(dish._id, dish.name[language])}
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

      {/* MODAL VIEW */}
      {selectedDishId && (
        <DishDetailModal dishId={selectedDishId} onClose={() => setSelectedDishId(null)} />
      )}
    </AdminLayout>
  );
};
