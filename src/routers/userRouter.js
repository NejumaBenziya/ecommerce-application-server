const express=require("express")
const router=express.Router()
const {registerController, loginController,productListController,cartController,reviewController,orderController,cancelOrderController}=require("../controllers/userController")
const {memberOnlyMiddleware}=require("../middlewares/authenticationMiddleware")
router.post("/register",registerController)
router.post("/login",loginController)
router.get("/product-list",productListController)
router.post("/addtocart",memberOnlyMiddleware,cartController)
router.post("/review",memberOnlyMiddleware,reviewController)
router.post("/order",memberOnlyMiddleware,orderController)
router.put("/cancel-order",memberOnlyMiddleware,cancelOrderController)


module.exports=router