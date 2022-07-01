//fundamental express procedure and import dotenv
require("dotenv").config()
const express = require('express');
const app = express()
app.use(express.json())

//using cors
const cors = require("cors")
app.use(cors())

//import DB

const connectDB = require("./DB")
connectDB()


//import authentication controller
const AuthController = require("./controller/auth")
const verifyToken = require("./middleware/auth")

app.use("/api/auth", AuthController)

// app.get("/", verifyToken, (req, res) => {
//     res.json({
//         post: "post"
//     })
// })



//init PORT for authentication server
const PORT = 4200
app.listen(process.env.PORT || PORT, () => console.log(`authServer has been init-ed at http://localhost:${PORT}`))

