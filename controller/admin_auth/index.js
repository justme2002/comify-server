const express = require("express")
const AdminController = express.Router();
const argon2 = require("argon2")
const jwt = require("jsonwebtoken")
const AdminModel = require("../../model/admin")
const CategoryModel = require("../../model/category")
const ComicModel = require("../../model/comic");
const verifySession = require("../../middleware/admin_middleware/sessionVerify")

//import multer

const multer = require("multer");
const upload = multer({ dest: "public/"})




AdminController.get("/", (req, res) => {
    res.render("index", {
        id: req.session.userId,
        username: req.session.username
    })
})

AdminController.get("/add_comic", verifySession, async (req, res) => {
    
    const category = await CategoryModel.find({})
    const comic = await ComicModel.find({})
    console.log(category)

    console.log(req.files)

    res.render("add_comic", {      
            category: category,
            comics: comic
        }
    )
})

AdminController.get("/view_comic", verifySession, async (req, res) => {
    
    try {
        const comic = await ComicModel.find({}).populate("category")
        res.render("view_comic", {
            username: req.session.username,
            comic
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: "500 extenal error"
        })
    }
})

AdminController.get("/login", (req, res) => {
    res.render("./auth/login", {
        username: ""
    })
})

AdminController.get("/register", (req, res) => {
    res.render("./auth/register", {
        username: ""
    })
})

AdminController.post("/store", async (req, res) => {
    try {
        const {
            username, password, email
        } = req.body
    
        if(!username && !password && !email) return res.json({success: false, message: "invalid input"})

        const hashed = await argon2.hash(password)
    
        const admin  = new AdminModel({
            username: username,
            password: hashed,
            email: email
        })

    
        await admin.save()
        
        res.json({
            success: true,
            message: "register successfully"
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "500 external error"
        })
    }
})

AdminController.post("/verify", async (req, res) => {
    const { username, password } = req.body

    try {
        if(!username && !password) return res.status(404).json({ success: false, message: "invalid username or password" })

        const admin = await AdminModel.findOne({ username: username })
        
        await argon2.verify(admin.password, password)

        req.session.adminId = admin._id
        req.session.username = admin.username

        console.log(req.session.adminId)

        res.status(200).redirect("/")

    } catch (error) {
        console.log(error)
        res.redirect("/login")
    }

})

AdminController.get("/logout", (req, res) => {
    req.session.destroy()

    res.redirect("/")
})

module.exports = AdminController

// AdminController.post("/store_comic", upload.fields([{name: "backgroundImage", maxCount: 1}, {name: "descriptionImage", maxCount: 3}, {name: "epsImage", maxCount: 20}]), async (req, res) => {
//     // res.json({
//     //     image: req.files["epsImage"]
//     // })

//     try {
//         let {
//             title,
//             description,
//             author,
//             category,
//         } = req.body
    
//         // get comic category
//         const getCategory = await CategoryModel.findOne({ category: category })
    
//         // give comic inputs
//         const comic = new ComicModel({
//             title: title,
//             description: description,
//             author: author,
//             category: getCategory._id,
//             image: {
//                 backgroundImage: req.files["backgroundImage"][0].filename,
//                 descriptionImage: req.files["descriptionImage"].map(image => image.filename)
//                 ,
//                 epsImage: req.files["epsImage"].map(image => image.filename)

//             }
//         })
    
//         await comic.save()
    
//         //update in category comic list
//         const updateCat = await CategoryModel.findOne({ category: category })
//         await CategoryModel.updateOne({ category: updateCat.category }, {
//             comic: [...updateCat.comic, comic]
//         })
    
    
//         res.json({
//             success: true,
//             message: "upload comic successfully"
//         })
//     } catch (error) {
//         console.log(error)
//         res.json(
//             {
//                 success: false,
//                 message: "500 external error"
//             }
//         )
//     }
// })


