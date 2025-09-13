const mongoose=require('mongoose')
const reviewSchema = new mongoose.Schema(
    {
       rating:{
        type:Number,
        required:[true,"rating is required"],
        min:[1,"Rating must be minimum 1"],
        max:[5,"Rating must be maximum 5"]
       },
       
      feedback: {
        type: String,
        required:[true,"feedback is required"],
        minlength: [10, "feedback must be at least 10 characters"],
        maxlength: [500, "feedback should not exceed 500 characters"],
      },
      review_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
       
      },
    
    },{
        timestamps : true
    }
)
const ReviewModel=mongoose.model("review",reviewSchema)
module.exports=ReviewModel   