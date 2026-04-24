const express=require("express")
const router=express.Router()

// Import admin controllers
const {
  addProductController,
  roleUpdateController,
  userListController,
  saleController,
  removeProductController,
  saleListController,
  removeSaleController,
  addSaleController
} = require("../controllers/adminController")

// Import authentication & authorization middlewares
const {
  memberOnlyMiddleware,
  adminOnlyMiddleware
} = require("../middlewares/authenticationMiddleware")

/**
 * ===========================
 * 🛠 ADMIN ROUTES
 * ===========================
 * 
 * All routes are protected by:
 * 1. memberOnlyMiddleware → checks if user is logged in
 * 2. adminOnlyMiddleware → checks if user is admin
 */


/**
 * Add new product
 * POST /admin/addproduct
 */
router.post(
  "/addproduct",
  memberOnlyMiddleware,
  adminOnlyMiddleware,
  addProductController
)

/**
 * Get all users (with optional role filter)
 * GET /admin/user-list
 */
router.get(
  "/user-list",
  memberOnlyMiddleware,
  adminOnlyMiddleware,
  userListController
)

/**
 * Update user role (admin/seller/member)
 * PUT /admin/update-role
 */
router.put(
  "/update-role",
  memberOnlyMiddleware,
  adminOnlyMiddleware,
  roleUpdateController
)

/**
 * Create a new sale/discount
 * POST /admin/addsale
 */
router.post(
  "/addsale",
  memberOnlyMiddleware,
  adminOnlyMiddleware,
  saleController
)

/**
 * Soft delete a product
 * PUT /admin/remove-product
 */
router.put(
  "/remove-product",
  memberOnlyMiddleware,
  adminOnlyMiddleware,
  removeProductController
)

/**
 * Get all sales
 * GET /admin/sale-list
 */
router.get(
  "/sale-list",
  memberOnlyMiddleware,
  adminOnlyMiddleware,
  saleListController
)

/**
 * Delete a sale (and reset affected products)
 * DELETE /admin/sales/:id
 */
router.delete(
  "/sales/:id",
  memberOnlyMiddleware,
  adminOnlyMiddleware,
  removeSaleController
)

/**
 * Apply a sale to a product
 * PUT /admin/add-sale
 */
router.put(
  "/add-sale",
  memberOnlyMiddleware,
  adminOnlyMiddleware,
  addSaleController
)

module.exports=router