const express=require("express")
const router=express.Router()
const {addProductController, roleUpdateController,userListController,saleController,removeProductController,saleListController,removeSaleController,addSaleController}=require("../controllers/adminController")
const {adminOnlyMiddleware}=require("../middlewares/authenticationMiddleware")
router.post("/addproduct",adminOnlyMiddleware,addProductController)
router.get("/user-list",adminOnlyMiddleware,userListController)
router.put("/update-role",adminOnlyMiddleware,roleUpdateController)
router.post("/addsale",adminOnlyMiddleware,saleController)
router.put("/remove-product",adminOnlyMiddleware,removeProductController)
router.get("/sale-list",adminOnlyMiddleware,saleListController)

router.delete("/sales/:id", adminOnlyMiddleware, removeSaleController);

router.put("/add-sale",adminOnlyMiddleware,addSaleController)
module.exports=router