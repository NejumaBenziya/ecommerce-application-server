const OrderModel=require("../models/orderModel");
const {getValidationErrorMessage}= require("../utils/validationUtils")

/**
 * Fetch all orders
 * Optional query:
 * - status → filter orders by status
 */
const orderListController = async (req, res) => {
  try {
    const statusFilter = req.query.status;
    let orders;

    // Filter orders if status is provided
    if (statusFilter) {
      orders = await OrderModel
        .find({ status: statusFilter })
        .populate("products.productId")
    } else {
      // Fetch all orders
      orders = await OrderModel
        .find()
        .populate("products.productId")
    }
     
    res.status(200).json({ message: "Fetched orders successfully", orders });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Something went wrong in the server. Please try again."
    });
  }
};

/**
 * Fetch single order details
 * Expects: orderId in query params
 */
const orderDetailsController=async(req,res)=>{
  try{
    const id  = req.query.orderId; 

    // Find order and populate product details
    const order = await OrderModel
      .findById(id)
      .populate("products.productId")

    console.log(order);

    // Check if order exists
    if(!order){
      return res.status(404).json({message:"Order not found"})
    }
    
    res.status(200).json({
      message:"Fetched order successfully",
      order
    })

  }catch(err){
    res.status(500).json({
      message:"Something went wrong in the server.Please try again."
    })
  }
}

/**
 * Update order status
 * Example: pending → shipped → delivered
 */
const statusUpdateController=async(req,res)=>{
  try{
    const orderId=req.body.orderId

    // Find order
    const order=await OrderModel.findById(orderId)

    // Check if order exists
    if(!order){
      return res.status(404).json({message:"Order not found"})
    }

    // Update status
    order.status=req.body.status

    await order.save()

    res.status(200).json({"message":"Status updated successfully"})

 }catch(err){
    
    // Handle validation errors
    if(err.name==="ValidationError"){
      const message=getValidationErrorMessage(err)
      res.status(400).json({message:message})
    }
    else{
      res.status(500).json({
        message:"Something went wrong in the server.Please try after some time."
      })
    }
  }
}

module.exports={
  orderListController,
  statusUpdateController,
  orderDetailsController
}