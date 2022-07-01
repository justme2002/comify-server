const express = require("express")
const InfoController = express.Router()
const verifyToken = require("../../middleware/auth")
const UserModel = require("../../model/user")


InfoController.get("/info", verifyToken,  async (req, res) => {
    try {
        const user = await UserModel.findOne({ _id: req.userId })

        res.json({
            success: true,
            message: "get user info successfully",
            id: user._id,
            username: user.username
        })

    } catch (error) {
        res.json({
            success: false,
            message: "user not found"
        })
    }
})

module.exports = InfoController