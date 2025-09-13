const mongoose =require('mongoose')

const userSchema=new mongoose.Schema({
    name : {
        type : String,
        required : [true,"Name is required"],
    },
    email:{
        type : String,
        required : [true,"Email is required"],
        unique : true,
        lowercase : true
    },
    password:{
        type : String,
        required : [true,"Password is required"],
        minlength : [8,"Password must be atleast 8 characters"]
    },
     phone : {
            type :String,
            required : [true,"Phone number is required"],
            minlength : [10,"phone number must be atleast 10 characters"],
            maxlenght : [15,"Phone number should not exceed more than 15 characters "] ,
            unique:true
        },
        role:{
           type:String,
        enum:["member","admin","seller"],
        default:"member"
        },
     cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 }
    }
  ],
    orders:[{
        type: mongoose.Schema.Types.ObjectId,
        ref : "order"
    }]
},{
    timestamps : true
})
const UserModel=mongoose.model("user",userSchema)
module.exports=UserModel