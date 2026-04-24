const mongoose =require('mongoose')

/**
 * User Schema
 * 
 * Handles:
 * - Authentication (email, password)
 * - Authorization (role)
 * - Wishlist
 * - Cart
 * - Orders
 */
const userSchema=new mongoose.Schema({

  /**
   * User name
   */
  name : {
    type : String,
    required : [true,"Name is required"],
  },

  /**
   * Email (unique & lowercase)
   */
  email:{
    type : String,
    required : [true,"Email is required"],
    unique : true,
    lowercase : true
  },

  /**
   * Hashed password
   */
  password:{
    type : String,
    required : [true,"Password is required"],
    minlength : [8,"Password must be atleast 8 characters"]
  },

  /**
   * Phone number (unique)
   */
  phone : {
    type :String,
    required : [true,"Phone number is required"],
    minlength : [10,"phone number must be atleast 10 characters"],
    maxlength : [15,"Phone number should not exceed more than 15 characters"],
    unique:true
  },

  /**
   * User role for authorization
   */
  role:{
    type:String,
    enum:["member","admin","seller"],
    default:"member"
  },

  /**
   * Wishlist (products saved by user)
   */
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product", 
    },
  ],

  /**
   * Cart items
   * Each item contains:
   * - productId
   * - quantity
   */
  cart: [
    {
      // ❗ Small inconsistency here (see below)
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 }
    }
  ],

  /**
   * Orders placed by user
   */
  orders:[{
    type: mongoose.Schema.Types.ObjectId,
    ref : "order"
  }]

},{
  timestamps : true // adds createdAt & updatedAt
})

const UserModel=mongoose.model("user",userSchema)

module.exports=UserModel