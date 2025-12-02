import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { getRestaurantById } from '@/services/restaurantService';
import { useQuery } from '@tanstack/react-query';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, ExternalLink, Globe, MapPin, Phone, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Link, useNavigate, useParams } from 'react-router-dom';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const RestaurantDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { data, isLoading, error } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => getRestaurantById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-6xl">
          <Skeleton className="h-8 w-24 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="aspect-4/3 rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-2/3" />
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
              <p className="text-sm text-destructive">Failed to load restaurant details.</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const restaurant = data.restaurant;
  const language = i18n.language as 'ja' | 'vi';
  const imageUrl = restaurant.images[0] || '/placeholder.jpg';

  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-6xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Image */}
          <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt={restaurant.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.jpg';
              }}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold mb-3">{restaurant.name}</h1>

              <div className="flex items-center gap-2 text-sm mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{restaurant.averageRating.toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground">({restaurant.reviewCount})</span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <span>{restaurant.address}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                <a href={`tel:${restaurant.phone}`} className="hover:underline">
                  {restaurant.phone}
                </a>
              </div>

              {restaurant.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    {t('restaurants.website')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {restaurant.website && (
              <Button className="w-full" asChild>
                <a href={restaurant.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('restaurants.visitWebsite')}
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Map */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <h2 className="text-base font-semibold mb-3">{t('restaurants.location')}</h2>
            <div className="aspect-[16/9] rounded-md overflow-hidden border relative z-0">
              <MapContainer
                center={[restaurant.location.coordinates[1], restaurant.location.coordinates[0]]}
                zoom={15}
                style={{ height: '100%', width: '100%', zIndex: 0 }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                  position={[
                    restaurant.location.coordinates[1],
                    restaurant.location.coordinates[0],
                  ]}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold text-sm">{restaurant.name}</h3>
                      <p className="text-xs text-muted-foreground">{restaurant.address}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        {/* Dishes Served */}
        {restaurant.dishes && restaurant.dishes.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h2 className="text-base font-semibold mb-3">{t('restaurants.dishesServed')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {restaurant.dishes.map((dish: any) => (
                  <Link key={dish._id} to={`/dishes/${dish._id}`} className="group block">
                    <div className="relative aspect-square bg-muted rounded-lg overflow-hidden mb-2">
                      <img
                        src={dish.images[0] || '/placeholder.jpg'}
                        alt={dish.name[language] || dish.name.ja}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.jpg';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {dish.name[language] || dish.name.ja}
                    </h3>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {dish.category}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};
