const ProductModel=require("../models/productModel")
const UserModel = require("../models/userModel")
const SaleModel=require("../models/saleModel")

const {getValidationErrorMessage}= require("../utils/validationUtils")
const addProductController=async (req,res)=>{
  try{
    const data=req.body
    console.log(data);
    const productImage=data.productImage
    const brandName=data.brandName
    const productName=data.productName
    const productCategory=data.productCategory
    const weight=data.weight 
    const price=data.price
    console.log(price);
    
    
    const  product=await ProductModel.create({
                    productImage,brandName,productName,productCategory,weight,price
                  })
    console.log("======");
    
    console.log(product);
    
    res.json({message:"Product added successfully"})
  }catch(err){
              
              
             if(err.name==="ValidationError"){
                const message=getValidationErrorMessage(err)
                
               res.status(400).json({message:message})
             }else{
                res.json({message:"Something went wrong in the server. Please try after some time."})
                console.log(err);
             }
            }
            
           
          
    
}
const roleUpdateController=async(req,res)=>{
  try{
    const userId=req.body.userID
    const user=await UserModel.findById(userId)
    user.role=req.body.role
    await user.save()
    res.json({"message":"Role updated successfully"})
 }catch(err){
    if(err.name==="ValidationError"){
      const message=getValidationErrorMessage(err)
      res.ststus(400).json({message:message})
    }
    else{
      res.status(500).json({message:"Something went wrong in the server.Please try after some time."})
    }
  }
}

const userListController=async(req,res)=>{
  try{
    const roleFilter=req.query.role
    let users
    if(roleFilter){
      users=await UserModel.find({role:roleFilter})
    }else{
      users=await UserModel.find()
    }
    res.json({message:"Fetched users successfully",users})
  }catch(err){
    res.status(500).json({message:"Something went wrong in the server.Please try after some time."})
  }
}
const saleController=async(req,res)=>{
 ///try{
  const {products,sale_tittle,percentage,valid_till}=req.body
  const sale=await SaleModel.create({sale_tittle,percentage,valid_till})
  products.map( async(p)=>{
     const product =await ProductModel.findById(p);
    product.sale=sale;
    await product.save()
  })
  res.json({message:"Sale added successfully"})
//}catch(err){
 // if(err.name==="ValidationError"){
                //const message=getValidationErrorMessage(err)
                
               // res.status(400).json({message:message})
             // }else if(err.name==="CastError"){
               //  res.status(500).json({message:err.message})
            //  }else{
            //    res.json({message:"Something went wrong in the server. Please try after some time."})
           //   }
//}
}
const removeProductController=async(req,res)=>{
  try{
  const data=req.body
   await ProductModel.deleteOne(data);
   res.json({message:"deleted successfully"})
  }catch(err){
    res.status(500).json({message:"Something went wrong in the server.Please try after some time."})
  }
}
const saleListController=async(req,res)=>{
  try{
    
      sales=await SaleModel.find()
    
    res.json({message:"Fetched sales successfully",sales})
  }catch(err){
    res.status(500).json({message:"Something went wrong in the server.Please try after some time."})
  }
}
const removeSaleController=async(req,res)=>{
  try{
  const data=req.body
   await SaleModel.deleteOne(data);
   res.json({message:"deleted successfully"})
  }catch(err){
    res.status(500).json({message:"Something went wrong in the server.Please try after some time."})
  }
}
module.exports= {addProductController,roleUpdateController,userListController,saleController,removeProductController,saleListController,removeSaleController}