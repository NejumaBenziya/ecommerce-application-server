// Function to generate HTML email template for order confirmation
const orderEmailTemplate = (user, order) => {

  // ===============================
  // CALCULATE TOTAL ORDER AMOUNT
  // ===============================
  // Sum of (price × quantity) for all products in the order
  const totalAmount = order.products.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ===============================
  // RETURN HTML EMAIL TEMPLATE
  // ===============================
  // Dynamic HTML string with user and order details
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      
      <!-- Email Heading -->
      <h2>🛒 Order Confirmation</h2>

      <!-- Greeting -->
      <p>Hi ${user.name},</p>
      <p>Your order has been placed successfully!</p>

      <!-- Order Details Section -->
      <h3>Order Details:</h3>

      <!-- Product Table -->
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="border-bottom: 1px solid #ddd; text-align: left;">Product</th>
            <th style="border-bottom: 1px solid #ddd;">Qty</th>
            <th style="border-bottom: 1px solid #ddd;">Price</th>
            <th style="border-bottom: 1px solid #ddd;">Total</th>
          </tr>
        </thead>

        <tbody>
          ${
            // Loop through each product in the order and create table rows
            order.products.map(item => `
            <tr>
              <td style="padding: 8px 0;">
                <!-- Brand Name (fallback if missing) -->
                <strong>${item.brandName || "Brand"}</strong><br/>
                
                <!-- Product Name (fallback if missing) -->
                ${item.productName || "Product"}
              </td>

              <!-- Quantity -->
              <td style="text-align: center;">${item.quantity}</td>

              <!-- Price per item -->
              <td style="text-align: center;">₹${item.price}</td>

              <!-- Total price for this product -->
              <td style="text-align: center;">
                ₹${item.price * item.quantity}
              </td>
            </tr>
          `).join("") // Convert array to string
          }
        </tbody>
      </table>

      <hr/>

      <!-- Total Order Amount -->
      <p><strong>Total Amount:</strong> ₹${totalAmount}</p>

      <!-- Payment Method Used -->
      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>

      <!-- Closing Message -->
      <p style="margin-top: 20px;">
        Thank you for shopping with us ❤️
      </p>
    </div>
  `;
};

// Export the template function for use in controllers/services
module.exports = orderEmailTemplate;