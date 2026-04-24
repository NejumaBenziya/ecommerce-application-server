const Razorpay = require("razorpay");

/**
 * Create a Razorpay instance using credentials from environment variables.
 * 
 * This instance will be used to interact with Razorpay APIs
 * such as creating orders and handling payments.
 * 
 * NOTE:
 * - Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are defined in your .env file
 * - Never hardcode these credentials for security reasons
 */
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,       // Public key provided by Razorpay
  key_secret: process.env.RAZORPAY_KEY_SECRET // Secret key (keep confidential)
});

/**
 * Export the configured Razorpay instance
 * so it can be reused across different parts of the application.
 */
module.exports = razorpayInstance;