// Import nodemailer library to send emails
const nodemailer = require("nodemailer");

// Utility function to send email
// Parameters:
// - to: recipient email address
// - subject: email subject line
// - html: HTML content of the email
const sendEmail = async (to, subject, html) => {
  try {

    // ===============================
    // CREATE EMAIL TRANSPORTER
    // ===============================
    // Configure nodemailer with Gmail service and authentication
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Sender email (stored in environment variables)
        pass: process.env.EMAIL_PASS, // App password (not actual Gmail password)
      },
    });

    // ===============================
    // EMAIL CONFIGURATION
    // ===============================
    // Define email details such as sender, receiver, subject, and content
    const mailOptions = {
      from: `"Luna" <${process.env.EMAIL_USER}>`, // Display name + sender email
      to,        // Recipient email
      subject,   // Email subject
      html,      // HTML body content (email template)
    };

    // ===============================
    // SEND EMAIL
    // ===============================
    // Send email using the transporter
    await transporter.sendMail(mailOptions);

    console.log("Email sent successfully");

  } catch (error) {
    // ===============================
    // ERROR HANDLING
    // ===============================
    // Log any errors that occur during email sending
    console.error("Email error:", error);
  }
};

// Export the function for use in other parts of the application
module.exports = sendEmail;