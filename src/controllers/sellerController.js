const OrderModel=require("../models/orderModel")
const {getValidationErrorMessage}= require("../utils/validationUtils")
const orderListController=async(req,res)=>{
  try{
    const statusFilter=req.query.status
    let orders
    if(statusFilter){
      orders=await OrderModel.find({status:statusFilter})
    }else{
      orders =await OrderModel.find()
    }
    res.json({message:"Fetched orders successfully",orders})
  }catch(err){
    res.status(500).json({"message":"Something went wrong in the server.Please try again."})
  }
}
const statusUpdateController=async(req,res)=>{
  try{
    const orderId=req.body.orderId
    const order=await OrderModel.findById(orderId)
    order.status=req.body.status
    await order.save()
    res.json({"message":"Status updated successfully"})
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

module.exports={orderListController,statusUpdateController}