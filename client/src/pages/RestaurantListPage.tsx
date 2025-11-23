import { AppLayout } from '@/components/layout/AppLayout';
import { RestaurantCard } from '@/components/RestaurantCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { getRestaurants } from '@/services/restaurantService';
import { useQuery } from '@tanstack/react-query';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, List, Map as MapIcon, Store } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const RestaurantListPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const [showMap, setShowMap] = useState(false);
    const dishId = searchParams.get('dish');

    const { data, isLoading, error } = useQuery({
        queryKey: ['restaurants', dishId, page],
        queryFn: () =>
            getRestaurants({
                page,
                limit: 12,
                dishId: dishId || undefined,
            }),
    });

    useEffect(() => {
        setPage(1);
    }, [dishId]);

    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    return (
        <AppLayout>
            <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('common.back')}
                </Button>

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">{t('restaurants.title')}</h1>
                        {data && (
                            <p className="text-sm text-muted-foreground">
                                {data.pagination.total} {t('restaurants.found')}
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

                {error && (
                    <Card className="border-destructive/50 bg-destructive/5 mb-6">
                        <CardContent className="p-4">
                            <p className="text-sm text-destructive">Failed to load restaurants. Please try again.</p>
                        </CardContent>
                    </Card>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="overflow-hidden">
                                <Skeleton className="aspect-[16/9]" />
                                <CardContent className="p-4 space-y-2">
                                    <Skeleton className="h-5 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-4 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : data?.restaurants.length === 0 ? (
                    <Card>
                        <CardContent className="p-16 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                <Store className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{t('restaurants.noRestaurants.title')}</h3>
                            <p className="text-muted-foreground">{t('restaurants.noRestaurants.subtitle')}</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {showMap ? (
                            /* Map View */
                            <div className="h-[600px] rounded-lg overflow-hidden border relative z-0">
                                <MapContainer
                                    center={[10.7769, 106.7008]} // Ho Chi Minh City
                                    zoom={13}
                                    style={{ height: '100%', width: '100%', zIndex: 0 }}
                                    zoomControl={true}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    {data?.restaurants.map((restaurant: any) => (
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
                                    {data?.restaurants.map((restaurant: any) => (
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

                                {data && data.pagination.totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-8">
                                        <Button
                                            variant="outline"
                                            size="sm"
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
                                                {t('common.of')} {data.pagination.totalPages}
                                            </span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage((p) => p + 1)}
                                            disabled={page === data.pagination.totalPages}
                                        >
                                            {t('common.next')}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
};
