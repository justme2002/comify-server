//fundamental express procedure and import dotenv
require("dotenv").config()
const express = require("express")
const app = express()
app.use(express.json())


//import cloudinary

const cloudinary = require("cloudinary").v2
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})


//import method-override

const methodOverride = require("method-override")
app.use(methodOverride("_method"))

//body-parser intergrated

const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.raw())

//register public folder
app.use(express.static("public"))
app.use(express.static("public/:id"))


//using cors
const cors = require("cors")
app.use(cors())


//import ejs template engine
app.set("view engine", "ejs")


//import DB

const connectDB = require("./DB")
connectDB()

//import authentication middleware

const verifyToken = require("./middleware/auth")

//Import comic controller
const ComicController = require("./controller/comic")
app.use(ComicController)

//Import info controller
const InfoController = require("./controller/info")
app.use(InfoController)

//get post
app.get("/", (req, res) => {
    res.json({
        post: "post"
    })
})




//init port

const PORT = 4000
app.listen(process.env.PORT || PORT, () => console.log(`server has been init-ed at http://localhost:${PORT}`))