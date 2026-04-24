const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Routers
const userRouter = require("./src/routers/userRouter");
const sellerRouter = require("./src/routers/sellerRouter");
const productRouter = require("./src/routers/adminRouter");

// const {getUserMiddleware}=require("./src/middlewares/authenticationMiddleware")

const port = process.env.PORT || 3000;


/**
 * ===========================
 * CORS CONFIGURATION
 * ===========================
 * Allows frontend apps to access backend with cookies
 */
const corsOptions = {
  origin: [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "https://ecommerce-application-client-nu3d-43x6j6kle.vercel.app",
  ],
  credentials: true,
};

app.use(cors(corsOptions));


/**
 * ===========================
 *  GLOBAL MIDDLEWARES
 * ===========================
 */

// Parse JSON request body
app.use(express.json());

// Parse cookies (JWT stored in cookies)
app.use(cookieParser());

// Optional global auth middleware
// app.use(getUserMiddleware)


/**
 * ===========================
 *  DATABASE CONNECTION
 * ===========================
 */
mongoose.connect(process.env.DB_CONNECTION_LINK)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("DB Connection Error:", err));


/**
 * ===========================
 *  ROUTES
 * ===========================
 */

// Health check route
app.get("/", (req, res) => {
  res.send("Ecommerce App");
});

// API routes
app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/admin", productRouter);


/**
 * ===========================
 *  404 HANDLER (IMPORTANT)
 * ===========================
 */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});


/**
 * ===========================
 * GLOBAL ERROR HANDLER
 * ===========================
 */
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({
    message: "Something went wrong in the server",
  });
});


/**
 * ===========================
 *  START SERVER
 * ===========================
 */
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});