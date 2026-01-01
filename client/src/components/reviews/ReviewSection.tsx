import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReviewCard } from './ReviewCard';
import { ReviewForm } from './ReviewForm';
import * as reviewService from '@/services/reviewService';

interface ReviewSectionProps {
  dishId: string;
  dishAverageRating: number;
  dishReviewCount: number;
}

export const ReviewSection = ({
  dishId,
  dishAverageRating,
  dishReviewCount,
}: ReviewSectionProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const currentUserId = user?._id;

  const [page, setPage] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingReview, setEditingReview] = useState<any | null>(null);

  const reviewsPerPage = 5;

  // Fetch reviews
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['dishReviews', dishId, page],
    queryFn: () => reviewService.getReviewsByDish(dishId, { page, limit: reviewsPerPage }),
  });

  // Check if the current user has already reviewed this dish
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userReview = data?.reviews.find((r: any) => r.user._id === currentUserId);
  const hasReviewed = !!userReview;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const otherReviews = data?.reviews.filter((r: any) => r.user._id !== currentUserId) || [];

  // --- Mutations ---
  const createMutation = useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment: string }) =>
      reviewService.createReview({ dishId, rating, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishReviews', dishId] });
      queryClient.invalidateQueries({ queryKey: ['dish', dishId] }); // Refresh dish details (rating, count)
      setIsCreating(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      reviewId,
      rating,
      comment,
    }: {
      reviewId: string;
      rating: number;
      comment: string;
    }) => reviewService.updateReview(reviewId, { rating, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishReviews', dishId] });
      queryClient.invalidateQueries({ queryKey: ['dish', dishId] });
      setEditingReview(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => reviewService.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dishReviews', dishId] });
      queryClient.invalidateQueries({ queryKey: ['dish', dishId] });
    },
  });

  // --- Handlers ---

  const handleCreateSubmit = (rating: number, comment: string) =>
    createMutation.mutateAsync({ rating, comment });

  const handleUpdateSubmit = (rating: number, comment: string) =>
    updateMutation.mutateAsync({ reviewId: editingReview._id, rating, comment });

  const handleDelete = (reviewId: string) => {
    if (window.confirm(t('reviews.confirmDelete'))) {
      deleteMutation.mutate(reviewId);
    }
  };

  // Check if any mutation is loading
  const isMutationLoading =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  if (isError) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="p-4">
          <p className="text-sm text-destructive">{t('reviews.loadFailed')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            Reviews ({dishReviewCount})
          </h2>
          <div className="text-lg font-semibold">{dishAverageRating.toFixed(1)} Average</div>
        </div>

        {/* Review Form / Edit Form */}
        {isAuthenticated && !isCreating && !editingReview && !hasReviewed && (
          <Button onClick={() => setIsCreating(true)} className="mb-6">
            Write Your Review
          </Button>
        )}

        {isCreating && (
          <ReviewForm
            initialRating={0}
            initialComment=""
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreating(false)}
            isEditing={false}
            isLoading={isMutationLoading}
          />
        )}

        {editingReview && (
          <ReviewForm
            initialRating={editingReview.rating}
            initialComment={editingReview.comment}
            onSubmit={handleUpdateSubmit}
            onCancel={() => setEditingReview(null)}
            isEditing={true}
            isLoading={isMutationLoading}
          />
        )}

        {/* User's Review (if exists and not editing) */}
        {userReview && !editingReview && (
          <div className="mb-6 p-4 border rounded-lg bg-secondary/30">
            <h3 className="text-md font-semibold mb-2">Your Current Review</h3>
            <ReviewCard
              review={userReview}
              currentUserId={currentUserId}
              onEdit={() => setEditingReview(userReview)}
              onDelete={handleDelete}
            />
          </div>
        )}

        {/* List of Reviews */}
        {(isLoading || isFetching) && !isMutationLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : data?.reviews.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Be the first to leave a review!
          </div>
        ) : (
          <>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {otherReviews?.map((review: any) => (
              <ReviewCard
                key={review._id}
                review={review}
                currentUserId={currentUserId}
                onEdit={() => setEditingReview(review)}
                onDelete={handleDelete}
              />
            ))}
            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isFetching}
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
                  disabled={page === data.pagination.totalPages || isFetching}
                >
                  {t('common.next')}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
