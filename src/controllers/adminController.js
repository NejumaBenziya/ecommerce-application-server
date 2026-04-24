const ProductModel=require("../models/productModel")
const UserModel = require("../models/userModel")
const SaleModel=require("../models/saleModel")

const {getValidationErrorMessage}= require("../utils/validationUtils")
const { log } = require("node:console")

/**
 * Add new product
 * @route POST /api/product
 * @desc Creates a product using request body data
 */
const addProductController=async (req,res)=>{
  try{
    const data=req.body
    
    // Extract fields from request body
    const productImage=data.productImage
    const brandName=data.brandName
    const productName=data.productName
    const productCategory=data.productCategory
    const weight=data.weight 
    const price=data.price
    const quantity=data.quantity
    
    // Create product in DB
    const product=await ProductModel.create({
      productImage,brandName,productName,productCategory,weight,price,quantity
    })
    
    res.status(201).json({message:"Product added successfully"})
  }catch(err){
    // Handle validation errors
    if(err.name==="ValidationError"){
      const message=getValidationErrorMessage(err)
      res.status(400).json({message:message})
    }else{
      console.log(err);
      res.status(500).json({message:"Something went wrong in the server. Please try after some time."})
    }
  }
}

/**
 * Update user role (admin/user)
 * @route PUT /api/user/role
 */
const roleUpdateController=async(req,res)=>{
  try{
    const userId=req.body._id

    // Fetch user
    const user=await UserModel.findById(userId)

    // Check if user exists
    if(!user){
      return res.status(404).json({message:"User not found"})
    }

    // Update role
    user.role=req.body.role
    await user.save()

    res.status(200).json({"message":"Role updated successfully"})
 }catch(err){
    if(err.name==="ValidationError"){
      const message=getValidationErrorMessage(err)
      res.status(400).json({message:message}) // ✅ fixed typo + status
    }
    else{
      res.status(500).json({message:"Something went wrong in the server.Please try after some time."})
    }
  }
}

/**
 * Fetch users (optionally filter by role)
 * @route GET /api/users
 */
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

    res.status(200).json({message:"Fetched users successfully",users})
  }catch(err){
    res.status(500).json({message:"Something went wrong in the server.Please try after some time."})
  }
}

/**
 * Create a new sale
 * @route POST /api/sale
 */
const saleController = async (req, res) => {
  try {
    const { sale_title, percentage, valid_till } = req.body;

    // Validate required fields
    if (!sale_title || !percentage || !valid_till) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create sale
    const sale = await SaleModel.create({
      sale_title,
      percentage,
      valid_till: new Date(valid_till)
    });

    res.status(201).json({ message: "Sale created successfully", sale });
  } catch (err) {
    console.error("❌ Sale creation error:", err);

    // Duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Sale title already exists. Please choose another title.",
      });
    }

    // Validation error
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: "Something went wrong in the server. Please try again." });
  }
};

/**
 * Soft delete product
 * @route DELETE /api/product
 */
const removeProductController = async (req, res) => {
  try {
    const { _id } = req.body;

    // Soft delete (mark instead of remove)
    const result = await ProductModel.updateOne(
      { _id },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product soft deleted successfully" });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Something went wrong in the server. Please try again later.",
    });
  }
};

/**
 * Fetch all sales
 * @route GET /api/sales
 */
const saleListController=async(req,res)=>{
  try{
     const sales=await SaleModel.find()
    
    res.status(200).json({message:"Fetched sales successfully",sales})
  }catch(err){
    res.status(500).json({message:"Something went wrong in the server.Please try after some time."})
  }
}

/**
 * Delete a sale and reset affected products
 * @route DELETE /api/sale/:id
 */
const removeSaleController = async (req, res) => {
  try {
    const saleId = req.params.id;

    // Delete sale
    const deletedSale = await SaleModel.findByIdAndDelete(saleId);

    if (!deletedSale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // Reset products linked to sale
    await ProductModel.updateMany(
      { sale: saleId },
      {
        $unset: { sale: "" },
        $set: { salePrice: null },
      }
    );

    res.status(200).json({ message: "Sale deleted and products reset" });
  } catch (err) {
    console.error("Error deleting sale:", err);

    res.status(500).json({
      message: "Something went wrong in the server. Please try after some time.",
    });
  }
};

/**
 * Apply sale to product
 * @route POST /api/product/add-sale
 */
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

    // Calculate discounted price
    const discount = (product.price * sale.percentage) / 100;
    product.salePrice = Math.max(product.price - discount, 0);
    
    await product.save();

    res.status(200).json({
      message: "Sale added to product",
      product,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Something went wrong in the server. Please try after some time.",
    });
  }
};

module.exports= {
  addProductController,
  roleUpdateController,
  userListController,
  saleController,
  removeProductController,
  saleListController,
  removeSaleController,
  addSaleController
}