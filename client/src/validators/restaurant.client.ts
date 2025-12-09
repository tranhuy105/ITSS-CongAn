import { z } from 'zod';
import { Location } from '../../../shared/types';

type CreateRestaurantPayload = {
  name: string;
  address: string;
  location: Location;
  phone: string;
  website?: string;
  images: string[];
  dishes?: string[]; // Array of Dish IDs (string)
};

type UpdateRestaurantPayload = Partial<CreateRestaurantPayload>;

// Schema cho GeoJSON Location
const locationClientSchema = z.object({
  type: z.literal('Point').default('Point'),
  coordinates: z.tuple([z.number(), z.number()]),
});

// CREATE SCHEMA
export const createRestaurantClientSchema = z.object({
  name: z.string().min(2, 'Restaurant name is required'),
  address: z.string().min(5, 'Address is required'),
  location: locationClientSchema,
  phone: z.string().min(8, 'Phone number is required'),
  website: z
    .string()
    .regex(/^https?:\/\/.+/, 'Invalid URL format')
    .optional()
    .or(z.literal('')),
  images: z
    .array(z.string().min(1, 'Image path cannot be empty'))
    .min(1, 'At least one image is required'),
  dishes: z.array(z.string()).optional(),
});

// UPDATE SCHEMA
export const updateRestaurantClientSchema: z.ZodType<UpdateRestaurantPayload> =
  createRestaurantClientSchema.partial();
