import mongoose, { Document, Model, Schema } from 'mongoose';

// Multilingual text interface
export interface MultilingualText {
  ja: string; // Japanese
  vi: string; // Vietnamese
}

// Ingredient interface
export interface Ingredient {
  name: string;
  quantity: string;
}

// Edit history interface
export interface EditHistory {
  version: number;
  data: Partial<IDish>;
  modifiedBy: mongoose.Types.ObjectId;
  modifiedAt: Date;
}

// Dish interface
export interface IDish extends Document {
  name: MultilingualText;
  description: MultilingualText;
  images: string[];
  ingredients: Ingredient[];
  category: string;
  region: string;
  cookingTime: number;
  averageRating: number;
  reviewCount: number;
  createdBy: mongoose.Types.ObjectId;
  history: EditHistory[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// Multilingual text schema
const multilingualTextSchema = new Schema<MultilingualText>(
  {
    ja: {
      type: String,
      required: [true, 'Japanese text is required'],
      trim: true,
    },
    vi: {
      type: String,
      required: [true, 'Vietnamese text is required'],
      trim: true,
    },
  },
  { _id: false }
);

// Ingredient schema
const ingredientSchema = new Schema<Ingredient>(
  {
    name: {
      type: String,
      required: [true, 'Ingredient name is required'],
      trim: true,
    },
    quantity: {
      type: String,
      required: [true, 'Ingredient quantity is required'],
      trim: true,
    },
  },
  { _id: false }
);

// Edit history schema
const editHistorySchema = new Schema<EditHistory>(
  {
    version: {
      type: Number,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    modifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    modifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Dish schema
const dishSchema = new Schema<IDish>(
  {
    name: {
      type: multilingualTextSchema,
      required: [true, 'Dish name is required'],
    },
    description: {
      type: multilingualTextSchema,
      required: [true, 'Dish description is required'],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (images: string[]) {
          return images.length <= 10;
        },
        message: 'Cannot have more than 10 images',
      },
    },
    ingredients: {
      type: [ingredientSchema],
      required: [true, 'Ingredients are required'],
      validate: {
        validator: function (ingredients: Ingredient[]) {
          return ingredients.length > 0;
        },
        message: 'At least one ingredient is required',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: {
        values: ['Phở', 'Bánh', 'Cơm', 'Bún', 'Gỏi', 'Lẩu', 'Chè', 'Khác'],
        message: 'Invalid category',
      },
    },
    region: {
      type: String,
      required: [true, 'Region is required'],
      trim: true,
      enum: {
        values: ['Miền Bắc', 'Miền Trung', 'Miền Nam'],
        message: 'Invalid region',
      },
    },
    cookingTime: {
      type: Number,
      required: [true, 'Cooking time is required'],
      min: [1, 'Cooking time must be at least 1 minute'],
      max: [1440, 'Cooking time cannot exceed 24 hours'],
    },
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
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    history: {
      type: [editHistorySchema],
      default: [],
    },
    // Soft delete field
    deletedAt: {
      type: Date,
      default: null,
      select: false, // Don't expose this field by default
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
dishSchema.index({ 'name.ja': 'text', 'name.vi': 'text' }); // Text search on names
dishSchema.index({ category: 1 });
dishSchema.index({ region: 1 });
dishSchema.index({ averageRating: -1 });
dishSchema.index({ createdAt: -1 });
dishSchema.index({ category: 1, region: 1 }); // Compound index for filtering
dishSchema.index({ deletedAt: 1 });

// Pre-save hook to track edit history
dishSchema.pre('save', function () {
  // Only track history if document is being modified (not on creation)
  if (!this.isNew && this.isModified()) {
    const currentVersion = this.history.length + 1;
    const modifiedFields: Partial<IDish> = {};

    // Track which fields were modified
    const modifiedPaths = this.modifiedPaths();
    modifiedPaths.forEach((path) => {
      if (path !== 'history' && path !== 'updatedAt') {
        modifiedFields[path as keyof IDish] = this.get(path);
      }
    });

    // Add to history if there are modified fields
    if (Object.keys(modifiedFields).length > 0) {
      this.history.push({
        version: currentVersion,
        data: modifiedFields,
        modifiedBy: this.createdBy, // This should be set by the controller
        modifiedAt: new Date(),
      });
    }
  }
});

// Create and export Dish model
const Dish: Model<IDish> = mongoose.model<IDish>('Dish', dishSchema);

export default Dish;
