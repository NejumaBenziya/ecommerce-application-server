const express=require("express")
const router=express.Router()
const {orderListController,statusUpdateController,orderDetailsController}=require("../controllers/sellerController")
const {sellerOnlyMiddleware,memberOnlyMiddleware}=require("../middlewares/authenticationMiddleware")
router.get("/orders-list",memberOnlyMiddleware,sellerOnlyMiddleware,orderListController)
router.put("/status-update",memberOnlyMiddleware,sellerOnlyMiddleware,statusUpdateController)
router.get("/order-details",memberOnlyMiddleware,sellerOnlyMiddleware,orderDetailsController)
module.exports=router