import { Alert } from '@/components/Alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import React, { useState } from 'react';
import { Textarea } from '../ui/textarea';

interface ReviewFormProps {
  initialRating: number;
  initialComment: string;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onCancel?: () => void;
  isEditing: boolean;
  isLoading: boolean;
}

// Simple star rating component
const StarRating = ({
  rating,
  setRating,
  disabled,
}: {
  rating: number;
  setRating: (r: number) => void;
  disabled: boolean;
}) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`w-5 h-5 cursor-pointer transition-colors ${
            index < rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
          } ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:fill-yellow-400 hover:text-yellow-400'}`}
          onClick={() => !disabled && setRating(index + 1)}
        />
      ))}
    </div>
  );
};

export const ReviewForm = ({
  initialRating,
  initialComment,
  onSubmit,
  onCancel,
  isEditing,
  isLoading,
}: ReviewFormProps) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      await onSubmit(rating, comment);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save review');
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          {isEditing ? 'Edit Your Review' : 'Write a Review'}
        </h3>
        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rating">
              Rating <span className="text-red-500">*</span>
            </Label>
            <StarRating rating={rating} setRating={setRating} disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Update Review' : 'Submit Review'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
