const ProductModel=require("../models/productModel")
const UserModel = require("../models/userModel")
const SaleModel=require("../models/saleModel")

const {getValidationErrorMessage}= require("../utils/validationUtils")
const { log } = require("node:console")
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
    const quantity=data.quantity
    
    
    const  product=await ProductModel.create({
                    productImage,brandName,productName,productCategory,weight,price,quantity
                  })
    
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
    const userId=req.body._id
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
      console.log(roleFilter);
      
      users=await UserModel.find({role:roleFilter})
    }else{
      users=await UserModel.find()
    }
    res.json({message:"Fetched users successfully",users})
  }catch(err){
    res.status(500).json({message:"Something went wrong in the server.Please try after some time."})
  }
}
const saleController = async (req, res) => {
  try {
    const { sale_title, percentage, valid_till } = req.body;

    if (!sale_title || !percentage || !valid_till) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const sale = await SaleModel.create({
      sale_title,
      percentage,
      valid_till: new Date(valid_till),
    });

    res.json({ message: "Sale created successfully", sale });
  } catch (err) {
    console.error("❌ Sale creation error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Sale title already exists. Please choose another title.",
      });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }

    res
      .status(500)
      .json({ message: "Something went wrong in the server. Please try again." });
  }
};


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


const removeSaleController = async (req, res) => {
  try {
    const saleId = req.params.id;

    // 1. Delete the sale
    const deletedSale = await SaleModel.findByIdAndDelete(saleId);

    if (!deletedSale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // 2. Reset products that had this sale
    await ProductModel.updateMany(
      { sale: saleId },
      {
        $unset: { sale: "" },       // remove sale reference
        $set: { salePrice: null },  // reset back to original price
      }
    );

    res.json({ message: "✅ Sale deleted and products reset" });
  } catch (err) {
    console.error("Error deleting sale:", err);
    res.status(500).json({
      message: "Something went wrong in the server. Please try after some time.",
    });
  }
};

const addSaleController = async (req, res) => {
  try {
    const { productId, saleId } = req.body;
      console.log(productId);
      console.log(saleId);
      
      
    // Find product
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find sale
    const sale = await SaleModel.findById(saleId);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // Attach sale
    product.sale = saleId;

    // Calculate sale price
    const discount = (product.price * sale.percentage) / 100;
    product.salePrice = Math.max(product.price - discount, 0); // prevent negative price
    
    await product.save();

    res.json({
      message: "Sale added to product",
      product,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({
        message: "Something went wrong in the server. Please try after some time.",
      });
  }
};

module.exports= {addProductController,roleUpdateController,userListController,saleController,removeProductController,saleListController,removeSaleController,addSaleController}