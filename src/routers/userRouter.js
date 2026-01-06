const express = require("express");
const router = express.Router();

const {
  registerController,
  loginController,
  
  productListController,
  cartController,
  reviewController,
  orderController,
  cancelOrderController,
  cartListController,
  productController,
  cartRemoveController,
  userOrderController,
  cartQuantityController,
  addReviewController,
  reviewListController
} = require("../controllers/userController");

const { memberOnlyMiddleware } = require("../middlewares/authenticationMiddleware");

// ✅ AUTH ROUTES
router.post("/register", registerController);
router.post("/login", loginController); // ✅ REAL LOGIN
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // localhost
  });

  res.json({ message: "Logged out successfully" });
});

// ✅ RESTORE LOGIN (ON REFRESH)
router.get("/me", memberOnlyMiddleware, (req, res) => {
  res.json({
  user: {
    id: req.user._id,
    email: req.user.email,
    role: req.user.role,
  },
  cartLength: req.user.cart?.length || 0,
});

});

// ✅ PUBLIC ROUTES
router.get("/product-list", productListController);
router.get("/product", productController);
router.get("/review-list", reviewListController);

// ✅ PROTECTED ROUTES
router.put("/addtocart", memberOnlyMiddleware, cartController);
router.put("/removecart", memberOnlyMiddleware, cartRemoveController);
router.get("/cart-list", memberOnlyMiddleware, cartListController);
router.post("/order", memberOnlyMiddleware, orderController);
router.put("/cancel-order", memberOnlyMiddleware, cancelOrderController);
router.get("/user-orders", memberOnlyMiddleware, userOrderController);
router.put("/quantity", memberOnlyMiddleware, cartQuantityController);
router.post("/add-review", memberOnlyMiddleware, addReviewController);
router.post("/review", memberOnlyMiddleware, reviewController);

module.exports = router;
