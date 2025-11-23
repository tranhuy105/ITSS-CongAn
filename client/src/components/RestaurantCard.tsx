import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RestaurantCardProps {
    id: string;
    name: string;
    address: string;
    phone: string;
    images: string[];
    averageRating: number;
    reviewCount: number;
    dishes?: any[];
    distance?: number;
}

export const RestaurantCard = ({
    id,
    name,
    address,
    phone,
    images,
    averageRating,
    reviewCount,
    dishes = [],
    distance,
}: RestaurantCardProps) => {
    const imageUrl = images[0] || '/placeholder.jpg';

    return (
        <Link to={`/restaurants/${id}`} className="group block h-full">
            <Card className="overflow-hidden h-full transition-all hover:shadow-lg hover:-translate-y-0.5">
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    <img
                        src={imageUrl}
                        alt={name}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.jpg';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {distance !== undefined && (
                        <Badge className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-900 border-0 shadow-md">
                            {distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`}
                        </Badge>
                    )}
                </div>

                <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold text-base line-clamp-1 group-hover:text-primary transition-colors">
                        {name}
                    </h3>

                    <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{averageRating.toFixed(1)}</span>
                        </div>
                        <span className="text-muted-foreground">({reviewCount})</span>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{address}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{phone}</span>
                    </div>

                    {dishes.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2 border-t">
                            {dishes.slice(0, 3).map((dish: any) => (
                                <Badge key={dish._id} variant="secondary" className="text-xs">
                                    {dish.category}
                                </Badge>
                            ))}
                            {dishes.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{dishes.length - 3}
                                </Badge>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
};
