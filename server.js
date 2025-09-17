const express=require("express")
const mongoose=require('mongoose')
const cookieParser=require('cookie-parser')
const app=express()
var cors = require('cors')
require('dotenv').config()
console.log(process.env.CLIENT_URL);


var corsOptions = {
  origin: [
    process.env.CLIENT_URL, 
    "http://localhost:5173",
    "https://ecommerce-application-client-nu3d-43x6j6kle.vercel.app", // preview URL
  ],
  optionsSuccessStatus: 200,
  credentials: true,
}


app.use(cors(corsOptions))
const userRouter=require("./src/routers/userRouter")
const sellerRouter=require("./src/routers/sellerRouter")
const productRouter=require("./src/routers/adminRouter")
const {getUserMiddleware}=require("./src/middlewares/authenticationMiddleware")


const port = process.env.PORT || 3000;

const dbConnectionLink=process.env.DB_CONNECTION_LINK
mongoose.connect(dbConnectionLink)
.then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));
app.use((req, res, next) => {
  console.log("👉 Incoming Origin:", req.headers.origin);
  next();
});
app.use(express.json())
app.use(cookieParser())
app.use(getUserMiddleware)

app.get('/',(req,res)=>{
    res.send('Ecommerce App')
})


app.use("/api/user",userRouter)
app.use("/api/seller",sellerRouter)
app.use("/api/admin",productRouter)
app.listen(port,()=>{
    console.log(`server running on port ${port}...`)
})  