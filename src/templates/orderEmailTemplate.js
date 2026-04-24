const orderEmailTemplate = (user, order) => {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>🛒 Order Confirmation</h2>

      <p>Hi ${user.name},</p>
      <p>Your order has been placed successfully!</p>

      <h3>Order Details:</h3>
      <ul>
        ${order.products.map(item => `
          <li>
            ${item.name || "Product"} - ${item.quantity} × ₹${item.price || 0}
          </li>
        `).join("")}
      </ul>

      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>

      <p>Thank you for shopping with us ❤️</p>
    </div>
  `;
};

module.exports = orderEmailTemplate;