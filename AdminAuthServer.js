//fundamental express procedure and import dotenv
require("dotenv").config()
const express = require('express');
const app = express()
app.use(express.json())

//body-parser intergrated

const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.raw())

//register public folder
app.use(express.static("public"))

//import ejs template engine
app.set("view engine", "ejs")

//using cors
const cors = require("cors")
app.use(cors())

//import express-session

const expressSession = require("express-session")
app.use(expressSession({
    secret: 'justme',
    resave: false,
    saveUninitialized: true,
}))

//import DB

const connectDB = require("./DB")
connectDB()


//import authentication controller
const AdminController = require('./controller/admin_auth')

app.use("/", AdminController)

// app.get("/", verifyToken, (req, res) => {
//     res.json({
//         post: "post"
//     })
// })



//init PORT for authentication server
const PORT = 4500
app.listen(process.env.PORT || PORT, () => console.log(`adminServer has been init-ed at http://localhost:${PORT}`))

