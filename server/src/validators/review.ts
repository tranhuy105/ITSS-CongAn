import { z } from 'zod';

// Schema for creating a new review
export const createReviewSchema = z.object({
  // dishId is sent in the body for POST /api/reviews
  dishId: z.string().min(1, 'Dish ID is required'),
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  comment: z.string().max(1000, 'Comment cannot exceed 1000 characters').optional(),
});

// Schema for updating an existing review
export const updateReviewSchema = z
  .object({
    rating: z
      .number()
      .int('Rating must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating cannot exceed 5')
      .optional(),
    comment: z.string().max(1000, 'Comment cannot exceed 1000 characters').optional(),
  })
  .refine((data) => data.rating !== undefined || data.comment !== undefined, {
    message: 'At least one field (rating or comment) must be provided for update',
  });

// Schema for get reviews with pagination params
export const getReviewsSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type GetReviewsInput = z.infer<typeof getReviewsSchema>;
