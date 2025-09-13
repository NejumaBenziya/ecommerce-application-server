const express=require("express")
const router=express.Router()
const {orderListController,statusUpdateController,orderDetailsController}=require("../controllers/sellerController")
const {sellerOnlyMiddleware}=require("../middlewares/authenticationMiddleware")
router.get("/orders-list",sellerOnlyMiddleware,orderListController)
router.put("/status-update",sellerOnlyMiddleware,statusUpdateController)
router.get("/order-details",sellerOnlyMiddleware,orderDetailsController)
module.exports=router