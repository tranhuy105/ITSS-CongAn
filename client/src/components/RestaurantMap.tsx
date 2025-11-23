import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getRestaurantsByDish } from '@/services/restaurantService';
import { useQuery } from '@tanstack/react-query';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Store } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RestaurantMapProps {
    dishId: string;
}

export const RestaurantMap = ({ dishId }: RestaurantMapProps) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { data, isLoading, error } = useQuery({
        queryKey: ['restaurants-by-dish', dishId],
        queryFn: () => getRestaurantsByDish(dishId),
    });

    if (isLoading) {
        return (
            <Card className="mb-6">
                <CardContent className="p-4">
                    <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {t('restaurants.nearby')}
                    </h2>
                    <Skeleton className="aspect-[16/9] rounded-md" />
                </CardContent>
            </Card>
        );
    }

    if (error || !data) {
        return null;
    }

    const restaurants = data.restaurants;

    if (restaurants.length === 0) {
        return (
            <Card className="mb-6">
                <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
                        <Store className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-sm font-semibold mb-1">{t('restaurants.noRestaurants.title')}</h3>
                    <p className="text-sm text-muted-foreground">
                        {t('restaurants.noRestaurantsForDish')}
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Calculate center of all restaurants
    const center: [number, number] = restaurants.length > 0
        ? [
            restaurants.reduce((sum: number, r: any) => sum + r.location.coordinates[1], 0) / restaurants.length,
            restaurants.reduce((sum: number, r: any) => sum + r.location.coordinates[0], 0) / restaurants.length,
        ]
        : [10.7769, 106.7008]; // Default to Ho Chi Minh City

    return (
        <Card className="mb-6">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {t('restaurants.nearby')} ({restaurants.length})
                    </h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/restaurants?dish=${dishId}`)}
                    >
                        {t('restaurants.viewAll')}
                    </Button>
                </div>
                <div className="aspect-[16/9] rounded-md overflow-hidden border relative z-0">
                    <MapContainer
                        center={center}
                        zoom={13}
                        style={{ height: '100%', width: '100%', zIndex: 0 }}
                        scrollWheelZoom={false}
                        zoomControl={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {restaurants.map((restaurant: any) => (
                            <Marker
                                key={restaurant._id}
                                position={[
                                    restaurant.location.coordinates[1],
                                    restaurant.location.coordinates[0],
                                ]}
                            >
                                <Popup>
                                    <div className="p-2 min-w-[200px]">
                                        <h3 className="font-semibold text-sm mb-1">{restaurant.name}</h3>
                                        <p className="text-xs text-muted-foreground mb-2">
                                            {restaurant.address}
                                        </p>
                                        <Button
                                            size="sm"
                                            className="w-full text-xs h-7"
                                            onClick={() => navigate(`/restaurants/${restaurant._id}`)}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </CardContent>
        </Card>
    );
};
