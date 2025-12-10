import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFavorites } from '@/hooks/useFavorites';
import { Clock, DollarSign, Heart, MapPin, Star, Users } from 'lucide-react';
// import { useState } from 'react';
import { Link } from 'react-router-dom';

interface DishCardProps {
  id: string;
  name: { ja: string; vi: string };
  description?: { ja: string; vi: string };
  images: string[];
  averageRating: number;
  reviewCount?: number;
  cookingTime: number;
  category: string;
  region?: string;
  price: number;
  language: 'ja' | 'vi';
}

export const DishCard = ({
  id,
  name,
  description,
  images,
  averageRating,
  reviewCount = 0,
  cookingTime,
  category,
  region,
  price = 0,
  language,
}: DishCardProps) => {
  const { isFavorite, isMutating, toggleFavorite } = useFavorites(id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleFavorite();
  };

  const displayName = name[language] || name.ja;
  const displayDescription = description?.[language] || description?.ja || '';
  const imageUrl = images?.[0]
    ? `${import.meta.env.VITE_BACKEND_URL}${images[0]}`
    : '/placeholder.jpg';

  // Format price (VND)
  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
  };

  return (
    <Link to={`/dishes/${id}`} className="group block h-full">
      <Card className="overflow-hidden h-full transition-all hover:shadow-2xl hover:-translate-y-1 border-border/50 bg-card">
        <div className="relative aspect-4/3 overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={displayName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-all z-10 disabled:opacity-50 disabled:cursor-wait"
            disabled={isMutating}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>

          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-white/90 backdrop-blur-sm text-gray-900 border-0 shadow-md">
              {category}
            </Badge>
            {region && (
              <Badge
                variant="secondary"
                className="bg-primary/90 backdrop-blur-sm text-primary-foreground border-0 shadow-md"
              >
                {region}
              </Badge>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-bold text-lg mb-1 line-clamp-2 drop-shadow-lg">{displayName}</h3>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {displayDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {displayDescription}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-sm">{averageRating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="text-xs">{reviewCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* PRICE */}
              {price > 0 && (
                <div className="flex items-center gap-1 text-green-600">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-semibold">{formatPrice(price)}</span>
                </div>
              )}
              {/* END PRICE */}

              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{cookingTime}m</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export const DishCardSkeleton = () => {
  return (
    <Card className="overflow-hidden h-full">
      <Skeleton className="aspect-4/3 rounded-none" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  );
};
