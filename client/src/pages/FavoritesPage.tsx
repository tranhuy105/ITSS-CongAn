import { DishCard, DishCardSkeleton } from '@/components/DishCard';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import * as userService from '@/services/userService';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Heart } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const FavoritesPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const favoritesPerPage = 12;

  const { data, isLoading, error } = useQuery({
    queryKey: ['favorites', page],
    queryFn: () => userService.getFavorites({ page, limit: favoritesPerPage }), // Gọi API favorites
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const language = i18n.language as 'ja' | 'vi';
  const totalDishes = data?.pagination.total || 0;
  const totalPages = data?.pagination.totalPages || 1;

  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Heart className="w-6 h-6 fill-red-500 text-red-500" />
            {t('favorites.title')} ({totalDishes})
          </h1>
        </div>

        {error && (
          <Card className="border-destructive/50 bg-destructive/5 mb-6">
            <CardContent className="p-4">
              <p className="text-sm text-destructive">{t('favorites.errorLoad')}</p>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <DishCardSkeleton key={i} />
            ))}
          </div>
        ) : totalDishes === 0 ? (
          <Card>
            <CardContent className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('favorites.noDishes.title')}</h3>
              <p className="text-muted-foreground">{t('favorites.noDishes.subtitle')}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {data?.dishes.map((dish: any) => (
                <DishCard
                  key={dish._id}
                  id={dish._id}
                  name={dish.name}
                  description={dish.description}
                  images={dish.images}
                  averageRating={dish.averageRating}
                  reviewCount={dish.reviewCount}
                  cookingTime={dish.cookingTime}
                  category={dish.category}
                  region={dish.region}
                  language={language}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  {t('common.previous')}
                </Button>
                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm font-medium">
                    {t('common.page')} {page}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {t('common.of')} {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                >
                  {t('common.next')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
};
