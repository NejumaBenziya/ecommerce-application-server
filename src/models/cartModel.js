const mongoose=require('mongoose')
const cartSchema = new mongoose.Schema(
    {
      
                product:{
                     type: mongoose.Schema.Types.ObjectId,
                     ref : "product"
                 },
                 quantity:{
                    type:Number,
                    default:1
                 }
           
        
    },{
        timestamps : true
    }
)
const CartModel=mongoose.model("cart",cartSchema)
module.exports=CartModel