const express=require("express")
const router=express.Router()
const {addProductController, roleUpdateController,userListController,saleController}=require("../controllers/adminController")
const {adminOnlyMiddleware}=require("../middlewares/authenticationMiddleware")
router.post("/addproduct",adminOnlyMiddleware,addProductController)
router.get("/user-list",adminOnlyMiddleware,userListController)
router.put("/update-role",adminOnlyMiddleware,roleUpdateController)
router.post("/addsale",adminOnlyMiddleware,saleController)
module.exports=router