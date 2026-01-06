const express=require("express")
const router=express.Router()
const {addProductController, roleUpdateController,userListController,saleController,removeProductController,saleListController,removeSaleController,addSaleController}=require("../controllers/adminController")
const {memberOnlyMiddleware,adminOnlyMiddleware}=require("../middlewares/authenticationMiddleware")
router.post("/addproduct",memberOnlyMiddleware,adminOnlyMiddleware,addProductController)
router.get("/user-list",memberOnlyMiddleware,adminOnlyMiddleware,userListController)
router.put("/update-role",memberOnlyMiddleware,adminOnlyMiddleware,roleUpdateController)
router.post("/addsale",memberOnlyMiddleware,adminOnlyMiddleware,saleController)
router.put("/remove-product",memberOnlyMiddleware,adminOnlyMiddleware,removeProductController)
router.get("/sale-list",memberOnlyMiddleware,adminOnlyMiddleware,saleListController)

router.delete("/sales/:id", memberOnlyMiddleware,adminOnlyMiddleware, removeSaleController);

router.put("/add-sale",memberOnlyMiddleware,adminOnlyMiddleware,addSaleController)
module.exports=router