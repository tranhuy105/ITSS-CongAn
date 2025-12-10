import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { X, Clock, Star, DollarSign } from 'lucide-react'; // <<< BỔ SUNG DollarSign
import { useQuery } from '@tanstack/react-query';
import { getDishByIdAdmin } from '@/services/dishService';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { RestaurantMap } from '@/components/RestaurantMap';
import { ReviewSection } from '@/components/reviews/ReviewSection';
import { IDish } from '../../../../shared/types';
import { Alert } from '../Alert';

interface DishDetailModalProps {
  dishId: string;
  onClose: () => void;
}

// Helper function để format giá tiền
const formatPrice = (p: number) => {
  // Sử dụng định dạng tiền tệ Việt Nam (VNĐ)
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
};

export const DishDetailModal: React.FC<DishDetailModalProps> = ({ dishId, onClose }) => {
  const { i18n } = useTranslation();

  const { data, isLoading, error } = useQuery({
    queryKey: ['adminDishDetail', dishId],
    queryFn: () => getDishByIdAdmin(dishId),
    enabled: !!dishId,
    select: (data) => data.dish as IDish & { deletedAt?: string },
  });

  if (isLoading) {
    return (
      <ModalShell title="Đang tải chi tiết món ăn..." onClose={onClose}>
        <Skeleton className="h-96 w-full" />
      </ModalShell>
    );
  }

  if (error || !data) {
    return (
      <ModalShell title="Lỗi" onClose={onClose}>
        <Alert type="error" message="Không thể tải chi tiết món ăn (Có thể đã bị xóa vĩnh viễn)." />
      </ModalShell>
    );
  }

  const dish = data;
  const language = i18n.language as 'ja' | 'vi';
  const displayName = dish.name[language] || dish.name.ja;
  const displayDescription = dish.description[language] || dish.description.ja;

  const baseUrl = import.meta.env.VITE_BACKEND_URL || '';
  const imageUrl = dish.images?.[0]
    ? `${baseUrl.replace(/\/$/, '')}${dish.images[0].startsWith('/') ? dish.images[0] : '/' + dish.images[0]}`
    : '/placeholder.jpg';

  const minPrice = dish.minPrice || 0;
  const maxPrice = dish.maxPrice || 0;
  const displayPrice =
    minPrice === maxPrice && minPrice > 0
      ? formatPrice(minPrice)
      : minPrice > 0 && maxPrice > 0
        ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
        : minPrice > 0
          ? `Từ ${formatPrice(minPrice)}`
          : 'Giá liên hệ';

  return (
    <ModalShell title={displayName} onClose={onClose} size="lg">
      <div className="space-y-6">
        {dish.deletedAt && (
          <Alert
            type="error"
            message="CẢNH BÁO: Món ăn này hiện đang bị xóa mềm và không hiển thị công khai."
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Section */}
          <div className="space-y-3">
            <div className="relative aspect-4/3 bg-muted rounded-lg overflow-hidden">
              <img src={imageUrl} alt={displayName} className="w-full h-full object-cover" />
              {/* Image Navigation (Giữ nguyên logic từ DishDetailPage) */}
            </div>
          </div>

          {/* Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{dish.averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({dish.reviewCount})</span>
              </div>

              {/* GIÁ (BỔ SUNG) */}
              <div className="flex items-center gap-1.5 text-green-600">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">{displayPrice}</span>
              </div>
              {/* END GIÁ */}

              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{dish.cookingTime} min</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">
                {dish.category}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {dish.region}
              </Badge>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-base font-semibold mb-2">Mô tả</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{displayDescription}</p>
            </div>
          </div>
        </div>

        {/* Review and Restaurant Map Sections */}
        <RestaurantMap dishId={dishId} />
        <ReviewSection
          dishId={dishId}
          dishAverageRating={dish.averageRating}
          dishReviewCount={dish.reviewCount}
        />
      </div>
    </ModalShell>
  );
};

const ModalShell: React.FC<{
  children: React.ReactNode;
  title: string;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg';
}> = ({ children, title, onClose, size = 'md' }) => {
  const maxWidth = size === 'lg' ? 'max-w-4xl' : size === 'md' ? 'max-w-2xl' : 'max-w-lg';
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className={`w-full ${maxWidth} max-h-[85vh] overflow-y-auto`}>
        <CardHeader className="flex flex-row justify-between items-center sticky top-0 bg-card z-10 border-b">
          <CardTitle>{title}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-6">{children}</CardContent>
      </Card>
    </div>
  );
};
