//import module
const express = require("express")
const ComicController = express.Router()
const ComicModel = require("../../model/comic")
const CategoryModel = require("../../model/category")
const UserModel = require("../../model/user")
const verifyToken = require("../../middleware/auth")

//import and config multer

const multer = require("multer");



// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "public")
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.filename)
//     }
// })

const upload = multer({
    dest: "public"
})

//import cloudinary

const cloudinary = require('cloudinary').v2


//get comic

ComicController.get("/comic", async (req, res) => {
    try {
        const comic = await ComicModel.find({}).sort({uploadDate: "descending"}).populate("comments.userComment")
        res.json({
            success: true,
            message: "get comic successFully",
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

//create category (test)
ComicController.post("/createCategory", async (req, res) => {
    try {
        const cat = req.body.category
        const category = new CategoryModel({
            category: cat,
        })
    
        await category.save()
    
        res.redirect("http://localhost:4500")
    } catch (error) {
        res.json(error)
    }
    
})

ComicController.get("/category", async (req, res) => {
    try {
        const categories = await CategoryModel.find({})
        res.json({
            success: true,
            message: "get category successfully",
            categories
        })
    } catch (error) {
        res.json({
            success: false,
            message: "500 external error"
        })
    }
})


//upload comic
ComicController.post("/store", upload.fields([{name: "backgroundImage", maxCount: 1}, {name: "descriptionImage", maxCount: 3}, {name: "epsImage", maxCount: 300}]), async (req, res) => {
    // res.json({
    //     image: req.files["epsImage"]
    // })

    try {
        let {
            title,
            description,
            author,
            category,
            epsNum
        } = req.body

        const backImage = await cloudinary.uploader.upload(req.files["backgroundImage"][0].path)
        const desImage = await Promise.all(req.files["descriptionImage"].map((image) => cloudinary.uploader.upload(image.path)))
        const epsImages = await Promise.all(req.files["epsImage"].map((image) => cloudinary.uploader.upload(image.path)))
        console.log(epsImages)

        // get comic category
        const getCategory = await CategoryModel.findOne({ category: category })

        // get comic 
    
        // give comic inputs
        const comic = new ComicModel({
            title: title,
            description: description,
            author: author,
            category: getCategory._id,
            backgroundImage: backImage.url,
            descriptionImage: desImage,
            eps: [
                {
                    epsNum: epsNum,
                    epsImages: epsImages
                }
            ]
        })
        await comic.save()


    

        //update in category comic list
        const updateCat = await CategoryModel.findOne({ category: category })
        await CategoryModel.updateOne({ category: updateCat.category }, {
            comic: [...updateCat.comic, comic]
        })
    
    
        res.json({
            success: true,
            message: "upload comic successfully"
        })
    } catch (error) {
        console.log(error)
        res.json(
            {
                success: false,
                message: "500 external error"
            }
        )
    }
})

//Update eps for comic

ComicController.post("/update", upload.fields([{name: "epImage", maxCount: 300}]), async (req, res) => {

    const { epsNum } = req.body
    const { title } = req.body

    try { 
        const getComic = await ComicModel.findOne({ title: title })
        const epsImage = await Promise.all(req.files["epImage"].map(image => cloudinary.uploader.upload(image.path)))
        const updateComic = await ComicModel.findOneAndUpdate({ title: title }, {
            eps: [
                ...getComic.eps,
                {
                    epsNum: epsNum,
                    epsImages: epsImage,
                }
            ]
        })

        res.status(200).json({
            success: true,
            message: "update comic successfully",
            updateComic
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "500 external error",
        })
    }
})

//Get current comic

ComicController.get("/getComic", async (req, res) => {
    try {

        const { id } = req.query
    
        const currentComic = await ComicModel.findOne({ _id: id }).populate("comments.userComment")

        res.json({
            success: true,
            message: "get current comic successfully",
            currentComic
        })

    } catch (error) {
        res.json({
            success: false,
            message: "500 external error"
        })
    }
})


// ComicController.get("/comic", async (req, res) => {
//     try {

//         const { id } = req.query
//         const { eps } = req.query
        
//         const comic = await ComicModel.findOne({ _id: id, image: { eps: [{ epsNum: eps }]} })
//         res.status(200).json({
//             success: true,
//             message: "get current comic successfully",
//             comic
//         })

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: "500 external error"
//         })
//     }
// })

ComicController.delete("/deleteComic", async (req, res) => {


    try {
        let { id } = req.query

        const getComic = await ComicModel.findOne({ _id: id })
        console.log(getComic)

        const getCategory = await CategoryModel.findOne({ _id: getComic.category })
        await CategoryModel.findOneAndUpdate({ _id: getCategory._id }, {
            comic: getCategory.comic.filter(com => com != getComic._id)
        })

        const deleteComic = await ComicModel.deleteOne({ _id: getComic._id })

        res.json({
            success: true,
            message: "update cat successfully",
            deleteComic
        })

    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: "500 external error || can not delete comic",
        })
    }
})

ComicController.post("/like", verifyToken, async (req, res) => {

    const { id } = req.body

    const getUser = await UserModel.findOne({ _id: req.userId })
    const getComic = await ComicModel.findOne({ _id: id })
    

    try {
        
        const isUserLiked = getComic.likes.includes(getUser._id)

        if(isUserLiked){
            const updateLike = await ComicModel.findOneAndUpdate({ _id: getComic._id }, {
                likes: getComic.likes.filter(userId => userId != req.userId)
            })

            return res.json({
                success: true,
                message: "a user has just unliked this comic",
                emit: "unlike",
                updateLike
            })
        } else {
            const updateLike = await ComicModel.findOneAndUpdate({ _id: getComic._id }, {
                likes: [
                    ...getComic.likes, getUser._id
                ]
            })

            return res.json({
                success: true,
                message: "a user has just liked this comic",
                emit: "like",
                updateLike
            })
        }

        
    
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: "500 external error || can not like this post"
        })
    }

})

ComicController.post("/comment", verifyToken, async (req, res) => {
    const { comicId, comment } = req.body

    try {
        
        const getUser = await UserModel.findOne({ _id: req.userId })
        const getComic = await ComicModel.findOne({ _id: comicId })
        const postComment = await ComicModel.findOneAndUpdate({ _id: getComic._id }, {
            comments: [...getComic.comments, {
                userComment: getUser._id,
                comment: comment
            }]
        })

        res.json({
            success: true,
            message: "a user has comment to this comic",
            postComment
        })

    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: "500 external error || failed on comment this post",
        })
    }
})


ComicController.post("/view", async (req, res) => {
    try {
        const getView = await ComicModel.findOne({ _id: req.body.comicId })
        await ComicModel.findByIdAndUpdate({ _id: req.body.comicId }, { views: getView.views + 1 })

        res.status(200).json({
            success: true,
            message: "updated view",
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "error"
        })
    }

})




module.exports = ComicController