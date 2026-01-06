const jwt=require("jsonwebtoken")
const JWT_SECRET=process.env.JWT_SECRET
const UserModel=require("../models/userModel")
const getUserMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token; // ✅ read from cookie

    if (!token) {
      return res.status(401).json({ message: "No token found" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await UserModel.findOne({ email: decoded.email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next(); // ✅ only call next if success
  } catch (err) {
    return res.status(401).json({ message: "Not authorized" });
  }
};
const adminOnlyMiddleware=(req,res,next)=>{
    if(req.user.role==="admin"){
        next()
    }else{
        return res.status(401).json({message:"User is not admin"})
    }

}
const memberOnlyMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Login required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
const sellerOnlyMiddleware=(req,res,next)=>{
    if(req.user.role==="seller"){
        next()
    }else{
        return res.status(401).json({message:"User is not seller"})
    }

}

module.exports={adminOnlyMiddleware,getUserMiddleware,memberOnlyMiddleware,sellerOnlyMiddleware}