const mongoose=require('mongoose')
const saleSchema = new mongoose.Schema(
    {
        sale_title:{
            type:String
           
        },
           percentage:{
            type:Number,
            required:[true,"percentage is required"],
            max:[99,"percentage should not exceed 99"]
           },
        
         valid_till:{
            type:Date,
            required:[true,"expiry date is required"],
            index: { expires: 0 }, 
         },
        
    },{
        timestamps : true
    }
)

const SaleModel=mongoose.model("sale",saleSchema)
module.exports=SaleModel    