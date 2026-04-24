const mongoose=require('mongoose');

/**
 * Order Schema
 * 
 * Represents a customer's order including:
 * - products
 * - delivery address
 * - payment details
 * - order status
 */
const orderSchema = new mongoose.Schema(
  {
    /**
     * List of ordered products
     */
    products: [
      {
        // Reference to product collection
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },

        // Quantity of product
        quantity: { type: Number, default: 1 },

        // Whether this specific product is cancelled
        cancelled:{type:Boolean,default:false},

        // Whether review is submitted for this product
        reviewDone:{type:Boolean,default:false}
      },
    ],

    /**
     * Customer name
     */
    name: {
      type: String,
      required: [true, "Name is required"],
    },

    /**
     * Address fields
     */
    houseName: {
      type: String,
      required: [
        true,
        "Flat, House no, Building, Company or Apartment is required",
      ],
    },

    street: {
      type: String,
      required: [true, "Area, Street, Sector or Village is required"],
    },

    // Optional landmark
    landMark: {
      type: String,
    },

    pincode: {
      type: Number,
      required: [true, "Pincode is required"],
    },

    city: {
      type: String,
      required: [true, "City or town is required"],
    },

    state: {
      type: String,
      required: [true, "State is required"],
    },

    /**
     * Customer phone number
     */
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      minlength: [10, "Phone number must be at least 10 characters"],
      maxlength: [15, "Phone number should not exceed 15 characters"],
    },

    /**
     * Payment method used
     */
    paymentMethod: {
      type: String,
      required: [true, "Payment Method is required"],
      enum: ["Net Banking", "Cash on Delivery"],
      default: "Net Banking",
    },

    /**
     * Order date
     */
    ordered_date: {
      type: Date,
      required: [true, "Ordered date is required"],
      default: Date.now,
    },

    /**
     * Order status
     * 
     * Possible values:
     * - ordered
     * - shipped
     * - cancelled
     * - delivered
     */
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: ["ordered", "shipped","cancelled" ,"delivered"],
      default: "ordered",
    },

    /**
     * Expected delivery date
     */
    expectedDate: {
      type: Date,
    },
   
  },
  { timestamps: true } // automatically adds createdAt & updatedAt
);

/**
 * Pre-save middleware
 * 
 * Purpose:
 * Automatically mark order as "cancelled"
 * if ALL products in the order are cancelled
 */
orderSchema.pre("save", function (next) {

  // Check if products exist
  if (this.products.length > 0) {

    // Check if every product is cancelled
    const allCancelled = this.products.every(
      (item) => item.cancelled === true
    );

    // If all cancelled → update order status
    if (allCancelled) {
      this.status = "cancelled";
    }
  }

  next();
});

/**
 * Order model
 */
const OrderModel=mongoose.model("order",orderSchema)

module.exports=OrderModel