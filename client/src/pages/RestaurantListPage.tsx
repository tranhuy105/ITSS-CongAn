import { AppLayout } from '@/components/layout/AppLayout';
import { RestaurantCard } from '@/components/RestaurantCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getDishById } from '@/services/dishService';
import { getRestaurants } from '@/services/restaurantService';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, List, Map as MapIcon, Store, Search, Star, X, DollarSign } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getImageUrl } from '@/lib/utils';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type RestaurantFilterSidebarProps = {
  localSearchQuery: string;
  setLocalSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  minRating: string;
  setMinRating: React.Dispatch<React.SetStateAction<string>>;
  maxRating: string;
  setMaxRating: React.Dispatch<React.SetStateAction<string>>;
  radiusKm: string;
  setRadiusKm: React.Dispatch<React.SetStateAction<string>>;
  userLatitude: number | null;
  userLongitude: number | null;
  isLocating: boolean;
  locationError: string;
  onUseMyLocation: () => void;
  isFiltered: boolean;
  onClearFilters: () => void;
};

type RestaurantListItem = {
  _id: string;
  name: string;
  address: string;
  phone: string;
  images: string[];
  averageRating: number;
  reviewCount: number;
  dishes: unknown[];
  location: { coordinates: [number, number] };
};

// Component Filter Sidebar cho Restaurants
const RestaurantFilterSidebar = ({
  localSearchQuery,
  setLocalSearchQuery,
  sortBy,
  setSortBy,
  minRating,
  setMinRating,
  maxRating,
  setMaxRating,
  radiusKm,
  setRadiusKm,
  userLatitude,
  userLongitude,
  isLocating,
  locationError,
  onUseMyLocation,
  isFiltered,
  onClearFilters,
}: RestaurantFilterSidebarProps) => {
  const { t } = useTranslation();

  const handleRatingChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string
  ) => {
    setter(value.replace(/[^0-9.]/g, ''));
  };

  // Format số không phụ thuộc vào locale
  const formatCoordinate = (value: number): string => {
    return value.toFixed(5);
  };

  return (
    <div className="sticky top-24 bg-card border rounded-lg p-4 space-y-4">
      <h2 className="text-lg font-semibold border-b pb-2 mb-4">{t('home.filters.title')}</h2>

      {/* Local Search Input */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('restaurantList.filters.searchPlaceholder')}
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Sorting */}
      <div className="pt-2 border-t space-y-2">
        <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
          {t('restaurantList.filters.sort.title')}
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full h-9 border rounded-md p-2 text-sm bg-background"
        >
          <option value="-updatedAt">{t('restaurantList.filters.sort.newestDefault')}</option>
          <option value="-averageRating">{t('restaurantList.filters.sort.ratingDesc')}</option>
          <option value="averageRating">{t('restaurantList.filters.sort.ratingAsc')}</option>
          <option value="-reviewCount">{t('restaurantList.filters.sort.reviewCountDesc')}</option>
          <option value="reviewCount">{t('restaurantList.filters.sort.reviewCountAsc')}</option>
        </select>
      </div>

      {/* Rating Filter */}
      <div className="pt-2 border-t space-y-2">
        <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          {t('restaurantList.filters.rating.title')}{' '}
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        </h3>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            step="0.1"
            min="0"
            max="5"
            placeholder={t('restaurantList.filters.rating.fromPlaceholder')}
            value={minRating}
            onChange={(e) => handleRatingChange(setMinRating, e.target.value)}
            className="w-1/2 h-9 text-sm"
          />
          -
          <Input
            type="number"
            step="0.1"
            min="0"
            max="5"
            placeholder={t('restaurantList.filters.rating.toPlaceholder')}
            value={maxRating}
            onChange={(e) => handleRatingChange(setMaxRating, e.target.value)}
            className="w-1/2 h-9 text-sm"
          />
        </div>
      </div>

      {/* Nearby Filter */}
      <div className="pt-2 border-t space-y-2">
        <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
          {t('restaurantList.filters.nearby.title')}
        </h3>
        <div className="space-y-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {t('restaurantList.filters.nearby.radiusPlaceholder')}
              </span>
              <span className="font-semibold text-primary">
                {radiusKm ? `${radiusKm} km` : '5 km'}
              </span>
            </div>
            <div className="py-4">
              <input
                type="range"
                min="0.5"
                max="15"
                step="0.5"
                value={radiusKm || '5'}
                onChange={(e) => setRadiusKm(e.target.value)}
                className="w-full slider cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>0.5 km</span>
              <span>5 km</span>
              <span>10 km</span>
              <span>15 km</span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={onUseMyLocation}
            disabled={isLocating}
          >
            {isLocating ? t('common.locating') : t('common.useMyLocation')}
          </Button>

          {locationError && <p className="text-xs text-destructive">{locationError}</p>}

          {userLatitude !== null && userLongitude !== null && (
            <p className="text-xs text-muted-foreground">
              {t('restaurantList.location.coords', {
                lat: formatCoordinate(userLatitude),
                lng: formatCoordinate(userLongitude),
              })}
            </p>
          )}

          {radiusKm && (userLatitude === null || userLongitude === null) && !locationError && (
            <p className="text-xs text-muted-foreground">
              {t('restaurantList.filters.nearby.radiusHint', { action: t('common.useMyLocation') })}
            </p>
          )}
        </div>
      </div>

      {/* Clear Filters */}
      {isFiltered && (
        <div className="pt-4 border-t">
          <Button variant="outline" size="sm" className="w-full" onClick={onClearFilters}>
            <X className="w-3 h-3 mr-2" />
            {t('home.filters.clear')}
          </Button>
        </div>
      )}
    </div>
  );
};

const DishFilterBanner = ({ dishId, language }: { dishId: string; language: 'ja' | 'vi' }) => {
  const { t } = useTranslation();
  const { data: dishData, isLoading: isDishLoading } = useQuery({
    queryKey: ['dishFilterDetail', dishId],
    queryFn: () => getDishById(dishId),
    enabled: !!dishId,
    staleTime: Infinity, // Dữ liệu này không cần refresh thường xuyên
    select: (data) => data.dish, // Lấy trực tiếp object dish
  });

  if (!dishId) return null;

  if (isDishLoading) {
    return (
      <Card className="mb-6 border-primary/50 bg-primary/5">
        <CardContent className="p-4 flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dishData) return null;

  const displayName = dishData.name[language] || dishData.name.ja;
  const imageUrl = getImageUrl(dishData.images?.[0]);

  // Format Price Logic (Copy từ DishCard hoặc DishDetailPage)
  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
  };
  const minPrice = dishData.minPrice || 0;
  const maxPrice = dishData.maxPrice || 0;
  const displayPrice =
    minPrice === maxPrice && minPrice > 0
      ? formatPrice(minPrice)
      : minPrice > 0 && maxPrice > 0
        ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
        : minPrice > 0
          ? t('common.priceFrom', { price: formatPrice(minPrice) })
          : t('common.priceContact');

  return (
    <Card className="mb-6 border-primary/50 bg-primary/5">
      <CardContent className="p-4 flex items-center gap-4">
        {/* Image - Left */}
        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
          <img
            src={imageUrl}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.jpg';
            }}
          />
        </div>

        {/* Info - Right */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase text-primary/80 mb-1">
            {t('home.filters.title')}:
          </p>
          <h3 className="text-lg font-bold line-clamp-1">{displayName}</h3>
          <div className="flex items-center gap-3 text-sm mt-1">
            <Badge variant="secondary" className="text-xs">
              {dishData.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {dishData.region}
            </Badge>
            {minPrice > 0 && (
              <span className="flex items-center gap-1 text-green-700">
                <DollarSign className="w-3 h-3" />
                <span className="font-semibold">{displayPrice}</span>
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const RestaurantListPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [showMap, setShowMap] = useState(false);

  // State for Filters
  const [localSearchQuery, setLocalSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('-updatedAt');
  const [minRating, setMinRating] = useState('');
  const [maxRating, setMaxRating] = useState('');
  const [radiusKm, setRadiusKm] = useState('');
  const [userLatitude, setUserLatitude] = useState<number | null>(null);
  const [userLongitude, setUserLongitude] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string>('');

  const dishId = searchParams.get('dish');
  const restaurantLimit = 12;

  const language = i18n.language as 'ja' | 'vi';

  const handleUseMyLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError(t('restaurantList.location.errors.notSupported'));
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLatitude(pos.coords.latitude);
        setUserLongitude(pos.coords.longitude);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        // Common: PERMISSION_DENIED, POSITION_UNAVAILABLE, TIMEOUT
        const msg =
          err.code === err.PERMISSION_DENIED
            ? t('restaurantList.location.errors.permissionDenied')
            : err.code === err.POSITION_UNAVAILABLE
              ? t('restaurantList.location.errors.positionUnavailable')
              : t('restaurantList.location.errors.timeout');
        setLocationError(msg);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  };

  const maxDistanceMeters =
    radiusKm && userLatitude !== null && userLongitude !== null
      ? Math.max(0, Math.round(parseFloat(radiusKm) * 1000))
      : undefined;

  // --- Infinite Query for Load More ---
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    // isFetching, // not needed as we use isFetchingNextPage and isLoading
  } = useInfiniteQuery({
    queryKey: [
      'restaurantsList',
      dishId,
      localSearchQuery,
      sortBy,
      minRating,
      maxRating,
      userLatitude,
      userLongitude,
      maxDistanceMeters,
    ],
    queryFn: ({ pageParam = 1 }) =>
      getRestaurants({
        page: pageParam,
        limit: restaurantLimit,
        dishId: dishId || undefined,
        search: localSearchQuery || undefined,
        sortBy: sortBy,
        minRating: minRating ? parseFloat(minRating) : undefined,
        maxRating: maxRating ? parseFloat(maxRating) : undefined,
        latitude: maxDistanceMeters !== undefined ? (userLatitude ?? undefined) : undefined,
        longitude: maxDistanceMeters !== undefined ? (userLongitude ?? undefined) : undefined,
        maxDistance: maxDistanceMeters,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    staleTime: 60 * 1000,
  });

  // Reset local search query when global search parameter changes
  useEffect(() => {
    setLocalSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Combined array of all fetched restaurants
  const allRestaurants = useMemo(() => {
    return (data?.pages.flatMap((page) => page.restaurants) || []) as RestaurantListItem[];
  }, [data]);

  const totalRestaurants = data?.pages[0]?.pagination.total || 0;

  const isFiltered =
    localSearchQuery ||
    sortBy !== '-updatedAt' ||
    minRating ||
    maxRating ||
    dishId ||
    maxDistanceMeters !== undefined;

  const handleClearFilters = () => {
    setLocalSearchQuery('');
    setSortBy('-updatedAt');
    setMinRating('');
    setMaxRating('');
    setRadiusKm('');
    setUserLatitude(null);
    setUserLongitude(null);
    setLocationError('');
    navigate('/restaurants');
  };

  const center: [number, number] =
    userLatitude !== null && userLongitude !== null
      ? [userLatitude, userLongitude]
      : allRestaurants.length > 0
        ? [
          allRestaurants.reduce((sum, r) => sum + r.location.coordinates[1], 0) /
          allRestaurants.length,
          allRestaurants.reduce((sum, r) => sum + r.location.coordinates[0], 0) /
          allRestaurants.length,
        ]
        : [10.7769, 106.7008];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">{t('restaurants.title')}</h1>
            {totalRestaurants > 0 && (
              <p className="text-sm text-muted-foreground">
                {totalRestaurants} {t('restaurants.found')}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMap(!showMap)}
            className="gap-2"
          >
            {showMap ? (
              <>
                <List className="w-4 h-4" />
                {t('restaurants.viewList')}
              </>
            ) : (
              <>
                <MapIcon className="w-4 h-4" />
                {t('restaurants.viewMap')}
              </>
            )}
          </Button>
        </div>

        {dishId && <DishFilterBanner dishId={dishId} language={language} />}

        {isFiltered && !dishId && (
          <div className="mb-6 flex items-center justify-end">
            <Button variant="link" onClick={handleClearFilters} className="text-sm p-0 h-auto">
              <X className="w-4 h-4 mr-1" />
              {t('home.filters.clear')}
            </Button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-72 shrink-0">
            <RestaurantFilterSidebar
              localSearchQuery={localSearchQuery}
              setLocalSearchQuery={setLocalSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              minRating={minRating}
              setMinRating={setMinRating}
              maxRating={maxRating}
              setMaxRating={setMaxRating}
              radiusKm={radiusKm}
              setRadiusKm={setRadiusKm}
              userLatitude={userLatitude}
              userLongitude={userLongitude}
              isLocating={isLocating}
              locationError={locationError}
              onUseMyLocation={handleUseMyLocation}
              isFiltered={isFiltered}
              onClearFilters={handleClearFilters}
            />
          </aside>

          {/* Content / List View */}
          <main className="flex-1 min-w-0">
            {isError && (
              <Card className="border-destructive/50 bg-destructive/5 mb-6">
                <CardContent className="p-4">
                  <p className="text-sm text-destructive">
                    {t('restaurants.error.loadFailed')}
                  </p>
                </CardContent>
              </Card>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: restaurantLimit }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-video" />
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : totalRestaurants === 0 ? (
              <Card>
                <CardContent className="p-16 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Store className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {t('restaurants.noRestaurants.title')}
                  </h3>
                  <p className="text-muted-foreground">{t('restaurants.noRestaurants.subtitle')}</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {showMap ? (
                  /* Map View */
                  <div className="h-[600px] rounded-lg overflow-hidden border relative z-0">
                    <MapContainer
                      center={center}
                      zoom={13}
                      style={{ height: '100%', width: '100%', zIndex: 0 }}
                      zoomControl={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {allRestaurants.map((restaurant) => (
                        <Marker
                          key={restaurant._id}
                          position={[
                            restaurant.location.coordinates[1],
                            restaurant.location.coordinates[0],
                          ]}
                        >
                          <Popup>
                            <div className="p-2">
                              <h3 className="font-semibold text-sm mb-1">{restaurant.name}</h3>
                              <p className="text-xs text-muted-foreground mb-2">
                                {restaurant.address}
                              </p>
                              <Button
                                size="sm"
                                className="w-full text-xs h-7"
                                onClick={() => navigate(`/restaurants/${restaurant._id}`)}
                              >
                                {t('restaurants.viewDetails')}
                              </Button>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                ) : (
                  /* List View */
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {allRestaurants.map((restaurant) => (
                        <RestaurantCard
                          key={restaurant._id}
                          id={restaurant._id}
                          name={restaurant.name}
                          address={restaurant.address}
                          phone={restaurant.phone}
                          images={restaurant.images}
                          averageRating={restaurant.averageRating}
                          reviewCount={restaurant.reviewCount}
                          dishes={restaurant.dishes}
                        />
                      ))}
                    </div>

                    {/* Load More Button (Xem thêm) */}
                    {hasNextPage && (
                      <div className="flex justify-center mt-12">
                        <Button
                          onClick={() => fetchNextPage()}
                          disabled={isFetchingNextPage}
                          variant="outline"
                          size="lg"
                        >
                          {isFetchingNextPage ? t('common.loading') : t('common.loadMoreSimple')}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </AppLayout>
  );
};
