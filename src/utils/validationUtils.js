/**
 * Extracts validation error messages from Mongoose error object
 * 
 * Input:
 * - err (Mongoose ValidationError)
 * 
 * Output:
 * - Object with field-wise error messages
 * 
 * Example:
 * {
 *   email: "Email is required",
 *   password: "Password must be at least 8 characters"
 * }
 */
const getValidationErrorMessage =(err)=>{

  // Get all field names with errors
  const keys = Object.keys(err.errors)

  // Get corresponding error objects
  const messages = Object.values(err.errors)

  // Final object to return
  const messageObject = {}

  // Loop through each error and map field → message
  for (let i=0; i<keys.length; i++){
    messageObject[keys[i]] = messages[i].message
  }

  return messageObject
}

module.exports = { getValidationErrorMessage }