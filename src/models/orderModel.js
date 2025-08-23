const mongoose=require('mongoose')
const orderSchema = new mongoose.Schema(
    {
       cart:[{
                     type: mongoose.Schema.Types.ObjectId,
                     ref : "cart"
                 }],
       name:{
                  type:String,
        required:[true,"Name is required"]
                 },

       houseName:{
        type:String,
        
        required:[true,"flat,House no,Building,Company or Apartment is required"]
       }  ,
       street:{
        type:String,
        required:[true,"Area,Street,Secter or Village is required"]
       } ,
       landMark:{
        type:String
       }  ,
       pincode:{
        type:Number,
        required:[true,"pincode is required"]
       },
       city:{
        type:String,
        required:[true,"city or town is required"]
       } ,
       state:{
        type:String,
        required:[true,"state is required"]
       } ,
       phone : {
            type :String,
            required : [true,"Phone number is required"],
            minlength : [10,"phone number must be atleast 10 characters"],
            maxlenght : [15,"Phone number should not exceed more than 15 characters "] ,
            unique:true
        },
       paymentMethod:{
        type:String,
        required:[true,"payment Method is required"],
        enum:["Net Banking","Cash on Delivery"],
        default:"Net Banking"
       }  ,
       ordered_date:{
         type: Date,
         required:[true,"ordered date is required"],
         default:Date.now
       },
       status:{
         type:String,
        required:[true,"status is required"],
        enum:["ordered","cancelled","shipped","delivered"],
        default:"ordered"
       },
       expectedDate:{
        type:Date
       }
       
    },{
        timestamps : true
    }
)
const OrderModel=mongoose.model("order",orderSchema)
module.exports=OrderModel