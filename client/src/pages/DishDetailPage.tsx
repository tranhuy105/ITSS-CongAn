import { AppLayout } from '@/components/layout/AppLayout';
import { RestaurantMap } from '@/components/RestaurantMap';
import { ReviewSection } from '@/components/reviews/ReviewSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFavorites } from '@/hooks/useFavorites';
import { getDishById } from '@/services/dishService';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, Heart, MapPin, Star, Users, DollarSign } from 'lucide-react'; // <<< BỔ SUNG DollarSign
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

const formatPrice = (p: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
};

export const DishDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isFavorite, isMutating, toggleFavorite } = useFavorites(id || '');

  const { data, isLoading, error } = useQuery({
    queryKey: ['dish', id],
    queryFn: () => getDishById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-6xl">
          <Skeleton className="h-8 w-24 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-4/3 rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-6xl">
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4">
              <p className="text-sm text-destructive">
                {t('dishDetail.error.loadFailed')}
              </p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const dish = data.dish;
  const language = i18n.language as 'ja' | 'vi';
  const displayName = dish.name[language] || dish.name.ja;
  const displayDescription = dish.description[language] || dish.description.ja;

  const imageUrl = dish.images?.[currentImageIndex]
    ? `${import.meta.env.VITE_BACKEND_URL}${dish.images[currentImageIndex]}`
    : '/placeholder.jpg';

  const minPrice = dish.minPrice || 0;
  const maxPrice = dish.maxPrice || 0;

  const displayPrice =
    minPrice === maxPrice && minPrice > 0
      ? formatPrice(minPrice)
      : minPrice > 0 && maxPrice > 0
        ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
        : minPrice > 0
          ? t('common.priceFrom', { price: formatPrice(minPrice) })
          : t('common.priceContact');

  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-6xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          {/* Image Section */}
          <div className="lg:col-span-3 space-y-3">
            <div className="relative aspect-4/3 bg-muted rounded-lg overflow-hidden">
              <img
                src={imageUrl || '/placeholder.jpg'}
                alt={displayName}
                className="w-full h-full object-cover"
              />
              {dish.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev === 0 ? dish.images.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                  >
                    ‹
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev === dish.images.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                  >
                    ›
                  </Button>
                </>
              )}
            </div>

            {dish.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {dish.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
                        ? 'border-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}${image}`}
                      alt={`${displayName} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <h1 className="text-2xl font-bold">{displayName}</h1>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFavorite}
                  className="h-9 w-9 rounded-full shrink-0 disabled:opacity-50 disabled:cursor-wait"
                  disabled={isMutating}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                {/* Đánh giá */}
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{dish.averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({dish.reviewCount})</span>
                </div>

                {/* PRICE */}
                <div className="flex items-center gap-1.5 text-green-600">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-semibold">{displayPrice}</span>
                </div>
                {/* END PRICE */}

                {/* Thời gian nấu */}
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{t('dishDetail.cookingTimeMinutes', { minutes: dish.cookingTime })}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{t('dishDetail.servingsDefault')}</span>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <Badge variant="secondary" className="text-xs">
                  {dish.category}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {dish.region}
                </Badge>
              </div>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-sm font-semibold mb-2">{t('dishDetail.descriptionTitle')}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{displayDescription}</p>
            </div>

            <Button
              size="sm"
              className="w-full"
              onClick={() => navigate(`/restaurants?dish=${id}`)}
            >
              <MapPin className="w-4 h-4 mr-2" />
              {t('dishDetail.findRestaurants')}
            </Button>
          </div>
        </div>

        {/* Ingredients */}
        {dish.ingredients && dish.ingredients.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h2 className="text-base font-semibold mb-3">{t('dishDetail.ingredientsTitle')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {dish.ingredients.map((ingredient: any, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <span className="font-medium">{ingredient.name}</span>
                      {ingredient.quantity && (
                        <span className="text-muted-foreground ml-1.5">
                          — {ingredient.quantity}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Restaurant Map */}
        <RestaurantMap dishId={id!} />

        {/* Reviews */}
        <ReviewSection
          dishId={id!}
          dishAverageRating={dish.averageRating}
          dishReviewCount={dish.reviewCount}
        />
      </div>
    </AppLayout>
  );
};
