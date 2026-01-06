const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();

const userRouter = require("./src/routers/userRouter");
const sellerRouter = require("./src/routers/sellerRouter");
const productRouter = require("./src/routers/adminRouter");
//const {getUserMiddleware}=require("./src/middlewares/authenticationMiddleware")
const port = process.env.PORT || 3000;

// CORS
const corsOptions = {
  origin: [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "https://ecommerce-application-client-nu3d-43x6j6kle.vercel.app",
  ],
  credentials: true,
};
app.use(cors(corsOptions));

// Middlewares
app.use(express.json());
app.use(cookieParser());
//app.use(getUserMiddleware)
// DB
mongoose.connect(process.env.DB_CONNECTION_LINK)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Routes
app.get("/", (req, res) => {
  res.send("Ecommerce App");
});

app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/admin", productRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
