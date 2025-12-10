// Base API Response Types
export interface ApiResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Error Codes
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
}

// User Types
export enum UserRole {
  GUEST = 'guest',
  ADMIN = 'admin',
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isLocked: boolean;
  favorites: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Dish Types
export interface MultilingualText {
  ja: string;
  vi: string;
}

export interface Ingredient {
  name: string;
  quantity: string;
}

export interface IDish {
  _id: string;
  name: MultilingualText;
  description: MultilingualText;
  images: string[];
  ingredients: Ingredient[];
  category: string;
  region: string;
  cookingTime: number;
  averageRating: number;
  reviewCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  minPrice: number;
  maxPrice: number;
}

// Restaurant Types
export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface IRestaurant {
  _id: string;
  name: string;
  address: string;
  location: Location;
  phone: string;
  website: string;
  images: string[];
  dishes: string[];
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Review Types
export interface IReview {
  _id: string;
  user: string;
  dish: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: Omit<IUser, 'favorites'>;
  tokens: AuthTokens;
}
