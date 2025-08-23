const UserModel=require("../models/userModel")
const ProductModel =require("../models/productModel")
const CartModel=require("../models/cartModel")
const ReviewModel=require("../models/reviewModel")
const bcrypt=require('bcrypt')
var jwt=require('jsonwebtoken')
const saltRounds=Number(process.env.SALT_ROUNDS)
const jwt_secret=process.env.JWT_SECRET
const {getValidationErrorMessage}= require("../utils/validationUtils")
const OrderModel = require("../models/orderModel")

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
        var token=jwt.sign({email},jwt_secret)
        res.cookie('token',token,{maxAge:30*24*60*1000,httpOnly:true,sameSite:"None",secure:true})
        res.json({"message":"Login successfull"})
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
const cartController=async(req,res)=>{
  try{
  const user=req.user
  const data=req.body
  const cart =await CartModel.create(data)
  user.cart.push(cart._id)
  await user.save()
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
const reviewController=async(req,res)=>{
  try{
  const user=req.user
  
  const {product_id,rating,feedback}=req.body
  console.log(product_id);
  
  const product =await ProductModel.findById(product_id)
  console.log(product);
  
  const review_by=user._id
  const review=await ReviewModel.create({rating,feedback,review_by})
  
  
  product.reviews.push(review._id)
  
  
  await product.save()
  res.json({message:"Review added successfully"})
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
const orderController=async(req,res)=>{
  try{
  const user=req.user
  const cart=user.cart
 const name=user.name
  const phone=user.phone
  const {houseName,street,landMark,pincode,city,state,paymentMethod}=req.body
 
  const order= await OrderModel.create({cart,name,houseName,street,landMark,pincode,city,state,phone,paymentMethod})
  user.orders.push(order._id)
  await user.save()
  res.json({message:"Order placed successfully"})
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
const cancelOrderController=async(req,res)=>{
  try{
    const user=req.user
    const orderId=req.body.orderId
    if(user.orders.includes(orderId)){
    const order=await OrderModel.findById(orderId)
    order.status="cancelled"
    await order.save()
    res.json({"message":"Order cancelled successfully"})
    }
 }catch(err){
    if(err.name==="ValidationError"){
      const message=getValidationErrorMessage(err)
      res.status(400).json({message:message})
    }
    else{
      res.status(500).json({message:"Something went wrong in the server.Please try after some time."})
    }
  }
}
module.exports={registerController,loginController,productListController,cartController,reviewController,orderController,cancelOrderController}