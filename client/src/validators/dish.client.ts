import { z } from 'zod';
import { MultilingualText, Ingredient } from '../../../shared/types';

type CreateDishPayload = {
  name: MultilingualText;
  description: MultilingualText;
  images: string[];
  ingredients: Ingredient[];
  category: string;
  region: string;
  cookingTime: number;
  minPrice: number;
  maxPrice: number;
};

type UpdateDishPayload = Partial<CreateDishPayload>;

// --- SCHEMA ---
const multilingualTextClientSchema = z.object({
  ja: z.string().min(1, 'Japanese name is required'),
  vi: z.string().min(1, 'Vietnamese name is required'),
});

const ingredientClientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  quantity: z.string().min(1, 'Ingredient quantity is required'),
});

// CLIENT CREATE SCHEMA
export const createDishClientSchema = z
  .object({
    name: multilingualTextClientSchema,
    description: multilingualTextClientSchema,
    images: z
      .array(z.string().min(1, 'Image path cannot be empty'))
      .min(1, 'At least one image is required'),
    ingredients: z.array(ingredientClientSchema).min(1, 'At least one ingredient is required'),
    category: z.string().min(1, 'Category is required'),
    region: z.string().min(1, 'Region is required'),
    cookingTime: z.number().min(1, 'Cooking time must be at least 1 minute'),
    minPrice: z.number().min(0, 'Min price cannot be negative'),
    maxPrice: z.number().min(0, 'Max price cannot be negative'),
  })
  .refine((data) => data.minPrice <= data.maxPrice, {
    message: 'Min price cannot be greater than Max price',
    path: ['minPrice'],
  }) as z.ZodType<CreateDishPayload>;

// CLIENT UPDATE SCHEMA
export const updateDishClientSchema = z
  .object({
    name: multilingualTextClientSchema.optional(),
    description: multilingualTextClientSchema.optional(),
    images: z.array(z.string().min(1, 'Image path cannot be empty')).optional(),
    ingredients: z.array(ingredientClientSchema).optional(),
    category: z.string().optional(),
    region: z.string().optional(),
    cookingTime: z.number().min(1).optional(),
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
  })
  .refine(
    (data) => {
      if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: 'Min price cannot be greater than Max price',
      path: ['minPrice'],
    }
  ) as z.ZodType<UpdateDishPayload>;
