import mongoose, { Document, Model, Schema } from 'mongoose';

// Location interface for geospatial data
export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

// Restaurant interface
export interface IRestaurant extends Document {
  name: string;
  address: string;
  location: Location;
  phone: string;
  website: string;
  images: string[];
  dishes: mongoose.Types.ObjectId[];
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Location schema for GeoJSON
const locationSchema = new Schema<Location>(
  {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: [true, 'Coordinates are required'],
      validate: {
        validator: function (coords: number[]) {
          // Validate longitude and latitude ranges
          return (
            coords.length === 2 &&
            coords[0] >= -180 &&
            coords[0] <= 180 && // longitude
            coords[1] >= -90 &&
            coords[1] <= 90 // latitude
          );
        },
        message:
          'Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90',
      },
    },
  },
  { _id: false }
);

// Restaurant schema
const restaurantSchema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
      minlength: [2, 'Restaurant name must be at least 2 characters long'],
      maxlength: [200, 'Restaurant name cannot exceed 200 characters'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      minlength: [5, 'Address must be at least 5 characters long'],
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    location: {
      type: locationSchema,
      required: [true, 'Location is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: function (phone: string) {
          // Basic phone validation (allows various formats)
          return /^[\d\s\-\+\(\)]+$/.test(phone);
        },
        message: 'Please provide a valid phone number',
      },
    },
    website: {
      type: String,
      trim: true,
      validate: {
        validator: function (url: string) {
          if (!url) return true; // Optional field
          // Basic URL validation
          return /^https?:\/\/.+/.test(url);
        },
        message: 'Please provide a valid website URL',
      },
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (images: string[]) {
          return images.length <= 15;
        },
        message: 'Cannot have more than 15 images',
      },
    },
    dishes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Dish',
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Soft delete field
    deletedAt: {
      type: Date,
      default: null,
      select: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
restaurantSchema.index({ location: '2dsphere' }); // Geospatial index for location-based queries
restaurantSchema.index({ name: 'text' }); // Text search on name
restaurantSchema.index({ averageRating: -1 });
restaurantSchema.index({ createdAt: -1 });
restaurantSchema.index({ deletedAt: 1 });

// Method to find nearby restaurants
restaurantSchema.statics.findNearby = function (
  longitude: number,
  latitude: number,
  maxDistance: number = 10000 // Default 10km
) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance,
      },
    },
  });
};

// Method to find restaurants serving a specific dish
restaurantSchema.statics.findByDish = function (dishId: mongoose.Types.ObjectId) {
  return this.find({
    dishes: dishId,
  }).populate('dishes');
};

// Create and export Restaurant model
interface IRestaurantModel extends Model<IRestaurant> {
  findNearby(longitude: number, latitude: number, maxDistance?: number): Promise<IRestaurant[]>;
  findByDish(dishId: mongoose.Types.ObjectId): Promise<IRestaurant[]>;
}

const Restaurant: IRestaurantModel = mongoose.model<IRestaurant, IRestaurantModel>(
  'Restaurant',
  restaurantSchema
);

export default Restaurant;
