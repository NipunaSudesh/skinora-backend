import mongoose from "mongoose";

const catalogSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },

    brand: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    imageUrl: {
      type: String,
      required: true
    },

    shortDescription: {
      type: String,
      required: true,
      trim: true
    },

    longDescription: {
      overview: {
        type: String,
        required: true
      },

      keyUses: [
        {
          type: String
        }
      ],

      keyIngredients: [
        {
          type: String
        }
      ],

      howToUse: {
        type: String,
        required: true
      }
    },

    price: {
      type: Number,
      required: true
    },

    oldPrice: {
      type: Number,
      default: null
    },

    discountPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    reviewCount: {
      type: Number,
      default: 0
    },

    stockStatus: {
      type: String,
      enum: ["IN_STOCK", "OUT_OF_STOCK"],
      default: "IN_STOCK"
    },

    wishlist: {
      type: Boolean,
      default: false
    },

    country: {
      type: String,
      trim: true
    },

    tags: [
      {
        type: String,
        uppercase: true
      }
    ],

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("catalog",catalogSchema);
