const express=require("express")
const router=express.Router()
const {orderListController,statusUpdateController}=require("../controllers/sellerController")
const {sellerOnlyMiddleware}=require("../middlewares/authenticationMiddleware")
router.get("/orders-list",sellerOnlyMiddleware,orderListController)
router.post("/status-update",sellerOnlyMiddleware,statusUpdateController)
module.exports=router