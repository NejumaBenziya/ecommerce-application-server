const express=require("express")
const app=express()
const port=3000
app.get("/",(req,res)=>{
    res.send("Ecommerce App")
})
app.listen(port,()=>{
    console.log("server running...")
})