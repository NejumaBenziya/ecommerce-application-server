const jwt=require("jsonwebtoken")
const JWT_SECRET=process.env.JWT_SECRET
const UserModel=require("../models/userModel")

/**
 * Middleware to authenticate user from JWT token (stored in cookies)
 * 
 * Flow:
 * 1. Read token from cookies
 * 2. Verify token using JWT_SECRET
 * 3. Fetch user from DB
 * 4. Attach user to req.user
 */
const getUserMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token; // read token from cookies

    // If token is missing → user not logged in
    if (!token) {
      return res.status(401).json({ message: "No token found" });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user from database
    const user = await UserModel.findOne({ email: decoded.email });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user to request for next middleware/controller
    req.user = user;

    next(); // proceed to next middleware/controller

  } catch (err) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

/**
 * Middleware to allow only admin users
 */
const adminOnlyMiddleware=(req,res,next)=>{
  // Check user role
  if(req.user.role==="admin"){
    next()
  }else{
    return res.status(401).json({message:"User is not admin"})
  }
}

/**
 * Middleware to allow only authenticated members (similar to getUserMiddleware)
 * 
 * Note:
 * This middleware also verifies token and attaches user
 */
const memberOnlyMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: "Login required" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user
    const user = await UserModel.findOne({ email: decoded.email });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach user
    req.user = user;

    next();

  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

/**
 * Middleware to allow only sellers
 */
const sellerOnlyMiddleware=(req,res,next)=>{
  if(req.user.role==="seller"){
    next()
  }else{
    return res.status(401).json({message:"User is not seller"})
  }
}

module.exports={
  adminOnlyMiddleware,
  getUserMiddleware,
  memberOnlyMiddleware,
  sellerOnlyMiddleware
}