const express = require("express");
const router = express.Router();
const UserModel = require("../models/userModel")
const { OAuth2Client } = require("google-auth-library");
const bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')
const saltRounds = Number(process.env.SALT_ROUNDS)
const jwt_secret = process.env.JWT_SECRET
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

router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    const { email, name, sub } = payload;

    let user = await UserModel.findOne({ email });
    console.log("user",user)
  // Case 1: Existing user → link Google
    if (user) {
      if (!user.googleId) {
        user.googleId = sub;
        await user.save();
      }
    }

    // Case 2: New user → auto register
    else {
      user = await UserModel.create({
        name,
        email,
        googleId: sub,
        password: null,
        role: "member",
        wishlist: [],
        cart: [],
      });
    }
        
    const tokenJWT = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      jwt_secret,
      { expiresIn: "1d" }
    );

    
    res.cookie("token", tokenJWT, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });

   
    res.json({
      success: true,
      message: "Login successful",
      token: tokenJWT,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        wishlist: user.wishlist || [],
      },
    });

  } catch (err) {
    console.error("🔥 VERIFY ERROR:", err);
    res.status(401).json({ message: "Google login failed" });
  }
});

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