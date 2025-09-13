const mongoose=require('mongoose')
const productSchema = new mongoose.Schema(
  {
    productImage: {
      type: String,
      trim: true,
    },
    brandName: {
      type: String,
    },
    productName: {
      type: String,
      required: [true, "Name of product is required"],
    },
    productCategory: {
      type: String,
      enum: ["makeup", "skin", "hair", "bath and body"],
      default: "skin",
    },
    weight: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    quantity: {
      type: Number,
      default: 0,
    },isAvailable: { type: Boolean, default: true },
    rating: [{
      type: Number,
      min: [0, "Rating must be minimum 0"],
      max: [5, "Rating must be maximum 5"],
    }],
    reviews:[{
         type: mongoose.Schema.Types.ObjectId,
      ref: "review",
    }],
    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sale",
    },
    salePrice: { type: Number, default: null },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);
productSchema.pre("save", function (next) {
  if (this.quantity <= 0) {
    this.isAvailable = false;
  } else {
    this.isAvailable = true;
  }
  next();
});

const ProductModel =  mongoose.model("product", productSchema);

module.exports = ProductModel;
