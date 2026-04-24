const express=require("express")
const router=express.Router()

// Import seller controllers
const {
  orderListController,
  statusUpdateController,
  orderDetailsController
} = require("../controllers/sellerController")

// Import authentication & authorization middlewares
const {
  sellerOnlyMiddleware,
  memberOnlyMiddleware
} = require("../middlewares/authenticationMiddleware")

/**
 * ===========================
 *  SELLER ROUTES
 * ===========================
 * 
 * All routes are protected by:
 * 1. memberOnlyMiddleware → ensures user is logged in
 * 2. sellerOnlyMiddleware → ensures user has seller role
 */


/**
 * Get all orders (optional status filter)
 * 
 * GET /seller/orders-list
 */
router.get(
  "/orders-list",
  memberOnlyMiddleware,
  sellerOnlyMiddleware,
  orderListController
)

/**
 * Update order status (e.g., shipped, delivered)
 * 
 * PUT /seller/status-update
 */
router.put(
  "/status-update",
  memberOnlyMiddleware,
  sellerOnlyMiddleware,
  statusUpdateController
)

/**
 * Get details of a specific order
 * 
 * GET /seller/order-details
 */
router.get(
  "/order-details",
  memberOnlyMiddleware,
  sellerOnlyMiddleware,
  orderDetailsController
)

module.exports=router