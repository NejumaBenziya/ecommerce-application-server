const mongoose=require('mongoose')

/**
 * Product Schema
 * 
 * Represents a product in the e-commerce system
 * Includes:
 * - product details
 * - pricing
 * - stock
 * - ratings & reviews
 * - sale/discount info
 */
const productSchema = new mongoose.Schema(
  {
    /**
     * Product image URL
     */
    productImage: {
      type: String,
      trim: true,
    },

    /**
     * Brand name of the product
     */
    brandName: {
      type: String,
    },

    /**
     * Product name (required)
     */
    productName: {
      type: String,
      required: [true, "Name of product is required"],
    },

    /**
     * Product category
     */
    productCategory: {
      type: String,
      enum: ["makeup", "skin", "hair", "bath and body"],
      default: "skin",
    },

    /**
     * Product weight (e.g., 100ml, 200g)
     */
    weight: {
      type: String,
    },

    /**
     * Product price
     */
    price: {
      type: Number,
      required: [true, "Price is required"],
    },

    /**
     * Available stock quantity
     */
    quantity: {
      type: Number,
      default: 0,
    },

    /**
     * Indicates whether product is available for purchase
     * Automatically updated via pre-save hook
     */
    isAvailable: { 
      type: Boolean, 
      default: true 
    },

    /**
     * Array of ratings (0–5)
     */
    rating: [{
      type: Number,
      min: [0, "Rating must be minimum 0"],
      max: [5, "Rating must be maximum 5"],
    }],

    /**
     * References to review documents
     */
    reviews:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: "review",
    }],

    /**
     * Reference to sale (if product is on discount)
     */
    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sale",
    },

    /**
     * Discounted price (calculated separately)
     */
    salePrice: { 
      type: Number, 
      default: null 
    },

    /**
     * Soft delete flag
     */
    isDeleted: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true } // adds createdAt & updatedAt
);

/**
 * Pre-save middleware
 * 
 * Automatically updates product availability
 * based on stock quantity
 */
productSchema.pre("save", function (next) {

  if (this.quantity <= 0) {
    this.isAvailable = false;
  } else {
    this.isAvailable = true;
  }

  next();
});

/**
 * Product model
 */
const ProductModel = mongoose.model("product", productSchema);

module.exports = ProductModel;