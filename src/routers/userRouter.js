const express = require("express");
const router = express.Router();

// Import user controllers
const {
  registerController,
  loginController,
  createRazorpayOrder,
  productListController,
  searchController,
  addtowishlistController,
  wishlistRemoveController,
  wishlistController,
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

// Middleware for authenticated users
const { memberOnlyMiddleware } = require("../middlewares/authenticationMiddleware");


/**
 * ===========================
 *  AUTH ROUTES
 * ===========================
 */

/**
 * Register new user
 * POST /user/register
 */
router.post("/register", registerController);

/**
 * Login user
 * POST /user/login
 */
router.post("/login", loginController);

/**
 * Logout user (clear JWT cookie)
 * POST /user/logout
 */
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path:"/" ,
  });

  res.json({ message: "Logged out successfully" });
});

/**
 * Restore session (check logged-in user)
 * GET /user/me
 */
router.get("/me", memberOnlyMiddleware, (req, res) => {

  // Extra safety check
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // Calculate total cart quantity
  const cartLength = (req.user.cart || []).reduce(
    (acc, item) => acc + (item.quantity || 0),
    0
  );

  res.json({
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      cart:req.user.cart,
      wishlist:req.user.wishlist 
    },
    cartLength
  });
});


/**
 * ===========================
 *  PUBLIC ROUTES
 * ===========================
 */

/**
 * Get all products
 */
router.get("/product-list", productListController);

/**
 * Get single product
 */
router.get("/product", productController);

/**
 * Get reviews for a product
 */
router.get("/review-list", reviewListController);

/**
 * Search products
 */
router.get("/search",searchController);


/**
 * ===========================
 *  PROTECTED ROUTES
 * ===========================
 * Requires user to be logged in
 */

/**
 * Wishlist operations
 */
router.put("/addtowishlist", memberOnlyMiddleware, addtowishlistController);
router.put("/removewishlist", memberOnlyMiddleware, wishlistRemoveController);
router.get("/wishlist", memberOnlyMiddleware, wishlistController);

/**
 * Cart operations
 */
router.put("/addtocart", memberOnlyMiddleware, cartController);
router.put("/removecart", memberOnlyMiddleware, cartRemoveController);
router.get("/cart-list", memberOnlyMiddleware, cartListController);
router.put("/quantity", memberOnlyMiddleware, cartQuantityController);

/**
 * Order & payment
 */
router.post("/create-order", memberOnlyMiddleware, createRazorpayOrder); // Razorpay order
router.post("/order", memberOnlyMiddleware, orderController); // Place order
router.put("/cancel-order", memberOnlyMiddleware, cancelOrderController);
router.get("/user-orders", memberOnlyMiddleware, userOrderController);

/**
 * Reviews
 */
router.post("/add-review", memberOnlyMiddleware, addReviewController);
router.post("/review", memberOnlyMiddleware, reviewController);


module.exports = router;