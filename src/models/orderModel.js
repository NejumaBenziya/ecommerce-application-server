const mongoose=require('mongoose');
const { getDefaultAutoSelectFamily } = require('net');
const { type } = require('os');
const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
        quantity: { type: Number, default: 1 },
        cancelled:{type:Boolean,default:false},
         reviewDone:{type:Boolean,default:false}
      },
    ],
    name: {
      type: String,
      required: [true, "Name is required"],
    },
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
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      minlength: [10, "Phone number must be at least 10 characters"],
      maxlength: [15, "Phone number should not exceed 15 characters"],
     
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment Method is required"],
      enum: ["Net Banking", "Cash on Delivery"],
      default: "Net Banking",
    },
    ordered_date: {
      type: Date,
      required: [true, "Ordered date is required"],
      default: Date.now,
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: ["ordered", "shipped","cancelled" ,"delivered"],
      default: "ordered",
    },
    expectedDate: {
      type: Date,
    },
   
  },
  { timestamps: true }
);
orderSchema.pre("save", function (next) {
  // Check if there are products
  if (this.products.length > 0) {
    // If every product is marked as cancelled
    const allCancelled = this.products.every((item) => item.cancelled === true);

    if (allCancelled) {
      this.status = "cancelled";
    }
  }
  next();
});

const OrderModel=mongoose.model("order",orderSchema)
module.exports=OrderModel