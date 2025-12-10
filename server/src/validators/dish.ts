import { z } from 'zod';

const multilingualTextSchema = z.object({
  ja: z.string().min(1, 'Japanese name is required'),
  vi: z.string().min(1, 'Vietnamese name is required'),
});

const ingredientSchema = z.object({
  name: z.string().min(1, 'Ingredient name is required'),
  quantity: z.string().min(1, 'Ingredient quantity is required'),
});

const imagePathSchema = z.string().min(1, 'Image path cannot be empty');

export const createDishSchema = z.object({
  name: multilingualTextSchema,
  description: multilingualTextSchema,
  images: z.array(imagePathSchema).min(1, 'At least one image is required'),
  ingredients: z.array(ingredientSchema).min(1, 'At least one ingredient is required'),
  category: z.string().min(1, 'Category is required'),
  region: z.string().min(1, 'Region is required'),
  cookingTime: z.number().min(1, 'Cooking time must be at least 1 minute'),
  minPrice: z.number().min(0, 'Min price cannot be negative'),
  maxPrice: z.number().min(0, 'Max price cannot be negative'),
});

export const updateDishSchema = z
  .object({
    name: multilingualTextSchema.optional(),
    description: multilingualTextSchema.optional(),
    images: z.array(imagePathSchema).optional(),
    ingredients: z.array(ingredientSchema).optional(),
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
  );

export type CreateDishInput = z.infer<typeof createDishSchema>;
export type UpdateDishInput = z.infer<typeof updateDishSchema>;
