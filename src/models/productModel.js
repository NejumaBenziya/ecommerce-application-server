const mongoose=require('mongoose')
const productSchema = new mongoose.Schema(
    {
       
        productImage:{
            type:String,
            trim:true
        },
         brandName:{
        type:String,
     
       },
       productName : {
        type:String,
        required:[true,"Name of product is required"]
        
       },

       productCategory:{
        type:String,
        enum:["makeup","skin","hair","bath and body"],
        default:"skin"

       } ,
      
       weight: {
        type:String
       },
       price:
       {
        type:String,
        required:[true,"price is required"]
       },
       quantity:{
         type:Number,
         default:1
       },
       reviews:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"review"
       }]
    ,sale:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"sale"
    }},
    {
        timestamps : true
    }
)
const ProductModel=mongoose.model("product",productSchema)
module.exports=ProductModel