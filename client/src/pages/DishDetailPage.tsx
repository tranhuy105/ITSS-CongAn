import { AppLayout } from '@/components/layout/AppLayout';
import { RestaurantMap } from '@/components/RestaurantMap';
import { ReviewSection } from '@/components/reviews/ReviewSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { getDishById } from '@/services/dishService';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, Heart, MapPin, Star, Users } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

export const DishDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['dish', id],
    queryFn: () => getDishById(id!),
    enabled: !!id && isAuthenticated,
  });

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-6xl">
          <Skeleton className="h-8 w-24 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-[4/3] rounded-lg" />
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
                Failed to load dish details. Please try again.
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
            <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
              <img
                src={dish.images[currentImageIndex] || '/placeholder.jpg'}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.jpg';
                }}
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
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
                        ? 'border-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={image}
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
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="h-9 w-9 rounded-full flex-shrink-0"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm mb-3">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{dish.averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({dish.reviewCount})</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{dish.cookingTime} min</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>2-4 servings</span>
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
              <h2 className="text-sm font-semibold mb-2">Description</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{displayDescription}</p>
            </div>

            <Button
              size="sm"
              className="w-full"
              onClick={() => navigate(`/restaurants?dish=${id}`)}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Find Restaurants
            </Button>
          </div>
        </div>

        {/* Ingredients */}
        {dish.ingredients && dish.ingredients.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h2 className="text-base font-semibold mb-3">Ingredients</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {dish.ingredients.map((ingredient: any, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
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
