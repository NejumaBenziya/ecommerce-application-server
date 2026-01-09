const UserModel=require("../models/userModel")
const ProductModel =require("../models/productModel")

const bcrypt=require('bcrypt')
var jwt=require('jsonwebtoken')
const saltRounds=Number(process.env.SALT_ROUNDS)
const jwt_secret=process.env.JWT_SECRET
const {getValidationErrorMessage}= require("../utils/validationUtils")
const OrderModel = require("../models/orderModel")
const mongoose = require("mongoose");
const { log } = require("node:console")
const ReviewModel = require("../models/reviewModel")

const registerController=async (req,res)=>{
 
  try{
    const {name,email,password,phone}=req.body
    const user_email=await UserModel.findOne({email})
    const user_phone=await UserModel.findOne({phone})
    if(user_email){
        res.status(400).json({message:"User with this Email ID already exists"})
    }else if(user_phone){
        res.status(400).json({message:"User with this Phone Number already exists"})
    }else{
        bcrypt.hash(password,saltRounds,async function (err,hash) {
            if(hash){
              try{
              const newUser=await UserModel.create({
                name,email,password: hash,phone
              })
              res.json({message:"User registered successfully"})
            }catch(err){
              
              
              if(err.name==="ValidationError"){
                const message=getValidationErrorMessage(err)
                
                res.status(400).json({message:message})
              }else{
                res.json({message:"Something went wrong in the server. Please try after some time."})
              }
            }
            }else{
                res.status(400).json({message:"password is required."})
            }
            })
        }
      }catch(err){
        res.json({message:"Something went wrong in the server. Please try after some time."})
      }      
    
}
const loginController=async(req,res)=>{
  try{
       if(!req.body.email || !req.body.password) {
        return res.status(400).json({"message":"Email ID and password is required"})
       }
  
  const{email,password}=req.body
  const user=await UserModel.findOne({email})
  if(user){
    bcrypt.compare(password,user.password,function(err,result){
      if(result){
        var token = jwt.sign(
  { id: user._id, email: user.email, role: user.role },
  jwt_secret,
  { expiresIn: "1d" }
);

       res.cookie("token", token, {
  httpOnly: true,
  sameSite: "none",   // ✅ IMPORTANT
  secure: true,    // ✅ MUST be false on localhost
  maxAge: 24 * 60 * 60 * 1000,
});

       
res.json({
  success: true,
  message: "Login successful",
  token: token,   
  user: {
    id: user._id,
    email: user.email,
    role: user.role,
    cartLength: user.cart ? user.cart.length : 0
  }
})
      }else{
        res.status(401).json({"message":"Invalid credentials."})
      }
    })
  }else{
    res.status(401).json({"message":"Invalid credentials."})
  }
}catch(err){
    res.status(500).json({"message":"something went wrong in the server. Please try after sometime"})
}
}


const productListController=async(req,res)=>{
  try{
    const categoryFilter=req.query.productCategory
    let products
    if(categoryFilter){
      products=await ProductModel.find({productCategory:categoryFilter})
    }else{
      products =await ProductModel.find()
      
      
    }
    res.json({message:"Fetched products successfully",products})
  }catch(err){
    res.status(500).json({"message":"Something went wrong in the server.Please try again."})
  }
}
const productController=async(req,res)=>{
  try{
     const id  = req.query.productId; 

    const product = await ProductModel.findById(id)
    res.json({message:"Fetched product successfully",product})
  }catch(err){
    res.status(500).json({"message":"Something went wrong in the server.Please try again."})
  }
}

const cartRemoveController = async (req, res) => {
  try {
    const user = req.user;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "ProductId is required" });
    }

    // Ensure valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid productId" });
    }

    // Remove item from cart
    user.cart = user.cart.filter(
      (item) => item.productId.toString() !== productId
    );

    await user.save();

    res.json({
      message: "Removed product successfully",
      cart: user.cart
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong in the server. Please try again."
    });
  }
};

const cartController=async(req,res)=>{
  
  try{
  const user=req.user
   
 
  const {productId}=req.body
   
  const existingItem = user.cart.find(
  item => item.productId.toString() === productId
);
console.log(existingItem);

if (existingItem) {
  
  existingItem.quantity += 1;
} else {
  
  user.cart.push({ productId, quantity: 1 });
}

await user.save();
   
  res.json({message:"Add to cart successfully"})
  }catch(err){
    if(err.name==="ValidationError"){
                const message=getValidationErrorMessage(err)
                
                res.status(400).json({message:message})
              }else if(err.name==="CastError"){
                 res.status(500).json({message:err.message})
              }else{
                res.json({message:"Something went wrong in the server. Please try after some time."})
              }
  }
}
const cartQuantityController=async(req,res)=>{
  try{
     const user = req.user;
    const { productId } = req.body;
    const product = user.cart.find(
  item => item.productId.toString() === productId
  
);
 product.quantity -= 1;
 if(product.quantity===0)
 {
  user.cart = user.cart.filter(
      (item) => item.productId.toString() !== productId
    );
 }
 await user.save();
  }catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong in the server. Please try again."
    });
  }
}
const cartListController = async (req, res) => {
  try {
    const user = req.user;
    console.log("User cart:", user.cart);

   
    const productIds = user.cart.map(item => item.productId);

    
    const products = await ProductModel.find({ _id: { $in: productIds } });

    
    const cartItems = products.map(product => {
      const item = user.cart.find(
        c => c.productId.toString() === product._id.toString()
      );
      return {
        ...product.toObject(),
        quantity: item ? item.quantity : 1
      };
    });

    res.json({
      message: "Fetched cart products successfully",
      products: cartItems
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong in the server. Please try again."
    });
  }
};

const reviewController = async (req, res) => {
  try {
   const { product_id, rating} = req.body;
      console.log(rating);
  const product = await ProductModel.findById(product_id)
    product.rating.push(rating)
    await product.save();
  

    res.json({ message: "Rating added successfully", rating: product.rating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};
const addReviewController = async (req, res) => {
  try {
    const user = req.user;
    const review_by = user._id;
    const { product_id, rating, feedback, orderId } = req.body;

    // 1️⃣ Create review
    const review = await ReviewModel.create({
      rating,
      feedback,
      review_by,
    });

    // 2️⃣ Push review into product
    const product = await ProductModel.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    product.reviews.push(review);
    await product.save();

    // 3️⃣ Update order → mark reviewDone = true for that product
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const productItem = order.products.find(
      (item) => item.productId.toString() === product_id
    );
    if (productItem) {
      productItem.reviewDone = true;
      await order.save();
    }

    // ✅ Send response
    res.status(201).json({
      message: "Review added successfully",
      review,
      reviewDoneUpdated: !!productItem,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};


const reviewListController = async (req, res) => {
  try {
    const { productId } = req.query;  // 🔹 productId comes from query params

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    // 🔹 Populate reviews AND review_by inside reviews
    const product = await ProductModel.findById(productId)
      .populate({
        path: "reviews",
        populate: {
          path: "review_by", // field inside ReviewModel
          model: "user",     // make sure your user model is registered as "User"
          select: "name", // select only required fields
        },
      });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviews = product.reviews || [];
    console.log(reviews);

    res.json({
      message: "Fetched reviews successfully",
      reviews,
    });
  } catch (err) {
    console.error("Error in reviewListController:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};




const orderController = async (req, res) => {
  try {
    const user = req.user;

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    const { houseName, street, landMark, pincode, city, state, paymentMethod } = req.body;

    // Step 1: Check stock for all items
    for (let item of user.cart) {
      const product = await ProductModel.findById(item.productId);
      console.log(product);
      
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `${product.productName} is out of stock. Available: ${product.quantity}` 
        });
      }
    }

    // Step 2: Deduct stock
    for (let item of user.cart) {
      const product = await ProductModel.findById(item.productId);

      product.quantity -= item.quantity;
      await product.save(); // 👈 your pre-save middleware will auto update isAvailable
    }

    // Step 3: Create the order
    const order = await OrderModel.create({
      products: user.cart,
      name: user.name,
      phone: user.phone,
      houseName,
      street,
      landMark,
      pincode,
      city,
      state,
      paymentMethod,
    });

    // Step 4: Save order reference in user
    user.orders.push(order._id);

    // Step 5: Clear cart
    user.cart = [];
    await user.save();

    res.json({
      message: "Order placed successfully",
      orderId: order._id,
    });

  } catch (err) {
    console.error(err);

    if (err.name === "ValidationError") {
      const message = getValidationErrorMessage(err);
      res.status(400).json({ message });
    } else if (err.name === "CastError") {
      res.status(400).json({ message: err.message });
    } else {
      res.status(500).json({
        message: "Something went wrong in the server. Please try again later."
      });
    }
  }
};

const userOrderController=async (req,res)=>{
  try{
    const user=req.user
    const orderIds = user.orders
    const orders = await OrderModel.find({ _id: { $in: orderIds } })
  .populate("products.productId"); 

    res.json({
      message: "Fetched orders  successfully",
      orders: orders
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Something went wrong in the server. Please try again."
    });
  }
}


const cancelOrderController = async (req, res) => {
  try {
    const user = req.user;
    const { orderId, productId } = req.body;

    // Find the order
    const order = await OrderModel.findById(orderId).populate("products.productId");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find the product inside the order
    const productItem = order.products.find(
      (item) => item.productId._id.toString() === productId
    );

    if (!productItem) {
      return res.status(404).json({ message: "Product not found in this order" });
    }

    if (productItem.cancelled) {
      return res.status(400).json({ message: "Product already cancelled" });
    }

    // Mark it as cancelled
    productItem.cancelled = true;
    await order.save();

    // Restore the stock in ProductModel
    await ProductModel.findByIdAndUpdate(
      productId,
      { $inc: { quantity: productItem.quantity } }, // increase stock
      { new: true }
    );

    res.json({ message: "Product cancelled successfully", order });
  } catch (err) {
    console.error(err);
    if (err.name === "ValidationError") {
      const message = getValidationErrorMessage(err);
      res.status(400).json({ message });
    } else {
      res
        .status(500)
        .json({ message: "Something went wrong in the server. Please try again later." });
    }
  }
};

module.exports={registerController,loginController,productListController,cartController,reviewController,orderController,cancelOrderController,cartListController,productController,cartRemoveController,userOrderController,cartQuantityController,addReviewController,reviewListController}