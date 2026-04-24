const mongoose=require('mongoose')

/**
 * Sale Schema
 * 
 * Represents a discount offer in the system.
 * Includes:
 * - sale title
 * - discount percentage
 * - expiry date (auto-deletes after expiry)
 */
const saleSchema = new mongoose.Schema(
  {
    /**
     * Title of the sale (e.g., "Summer Sale", "Festive Offer")
     */
    sale_title:{
      type:String
    },

    /**
     * Discount percentage
     * Max allowed: 99%
     */
    percentage:{
      type:Number,
      required:[true,"percentage is required"],
      max:[99,"percentage should not exceed 99"]
    },
        
    /**
     * Expiry date of the sale
     * 
     * TTL Index:
     * - Automatically deletes the document after this date
     * - Useful for auto-expiring sales
     */
    valid_till:{
      type:Date,
      required:[true,"expiry date is required"],
      index: { expires: 0 }, 
    },
        
  },
  {
    timestamps : true // adds createdAt & updatedAt
  }
)

/**
 * Sale model
 */
const SaleModel=mongoose.model("sale",saleSchema)

module.exports=SaleModel