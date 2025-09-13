const jwt=require("jsonwebtoken")
const JWT_SECRET=process.env.JWT_SECRET
const UserModel=require("../models/userModel")
const getUserMiddleware=async(req,res,next)=>{
    
    try{
       const token=req.headers.authorization.split(" ")[1]
       var decoded=jwt.verify(token,JWT_SECRET)
        const user= await UserModel.findOne({email:decoded.email})
        req.user=user
        console.log(user);
        
    }catch(err){
        console.log("Not authorized");
        
    }
    next()
}
const adminOnlyMiddleware=(req,res,next)=>{
    if(req.user.role==="admin"){
        next()
    }else{
        return res.status(401).json({messag:"User is not admin"})
    }

}
const memberOnlyMiddleware=(req,res,next)=>{
    if(req.user.role==="member"){
        next()
    }else{
        return res.status(401).json({messag:"User is not member"})
    }

}
const sellerOnlyMiddleware=(req,res,next)=>{
    if(req.user.role==="seller"){
        next()
    }else{
        return res.status(401).json({messag:"User is not seller"})
    }

}

module.exports={adminOnlyMiddleware,getUserMiddleware,memberOnlyMiddleware,sellerOnlyMiddleware}