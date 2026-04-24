const mongoose=require('mongoose')

/**
 * Review Schema
 * 
 * Represents a user review for a product.
 * Includes:
 * - rating (1–5)
 * - feedback text
 * - reference to user who gave the review
 */
const reviewSchema = new mongoose.Schema(
  {
    /**
     * Rating given by user
     * Range: 1 to 5
     */
    rating:{
      type:Number,
      required:[true,"rating is required"],
      min:[1,"Rating must be minimum 1"],
      max:[5,"Rating must be maximum 5"]
    },
       
    /**
     * Review feedback (text)
     */
    feedback: {
      type: String,
      required:[true,"feedback is required"],
      minlength: [10, "feedback must be at least 10 characters"],
      maxlength: [500, "feedback should not exceed 500 characters"],
    },

    /**
     * Reference to user who wrote the review
     */
    review_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    
  },
  {
    timestamps : true // adds createdAt & updatedAt
  }
)

/**
 * Review model
 */
const ReviewModel=mongoose.model("review",reviewSchema)

module.exports=ReviewModel