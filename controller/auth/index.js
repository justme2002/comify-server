//import modules
const express = require("express")
const AuthController = express.Router()
const UserModel = require("../../model/user")
const argon2 = require("argon2")
const jwt = require("jsonwebtoken")
const verifyToken = require("../../middleware/auth")

//create token generating function
const generateToken = ({id, username}) => {
    const accessToken = jwt.sign({id, username}, process.env.ACCESS_TOKEN, {
        expiresIn: "12h"
    })

    return {
        accessToken,
    }
}

    const generateRefreshToken = ({id, username}) => {
        const token = jwt.sign({id, username}, process.env.REFRESH_TOKEN)

        return {
            token
        }
    }

    // const updateToken = async (token) => {
    //     // await UserModel.findOneAndUpdate({ username: username }, {
    //     //     refreshToken: token
    //     // })

    //     return {
    //         token
    //     }
    // }


//register route
AuthController.post("/store", async (req, res) => {
    const { username, password, email } = req.body

    //if username and password got black input
    if (!username && !password && !email) return res.status(404).json({ success: false, message: "please fill all required infomation"})


    //all good
    try {
        const hashed = await argon2.hash(password)
        const user = new UserModel({
            username: username,
            password: hashed,
            email: email
        })
        await user.save()

    res.status(200).json({
        success: true,
        message: "register new user successfully"
    })

    } catch (error) {
     //external error
        console.log(error)
        res.status(500).json({
            success: false,
            message: "500 external error"
        })
    }
})


//login route
AuthController.post("/verify", async (req, res) => {
    const { username, password } = req.body

    //if username and password got black input
    if(!username && !password) return res.status(400).json({ success: false, message: "incorrect username or password" })
    

    //all good
    try {
        const findUser = await UserModel.findOne({ username })
        await argon2.verify(findUser.password, password)

        //token generating
        const token = generateToken({ id: findUser._id, username: findUser.username })
        const refreshToken = generateRefreshToken({ id: findUser._id, username: findUser.username})
        await UserModel.findByIdAndUpdate(findUser._id, {
            refreshToken: refreshToken.token
        })


        
        res.status(200).json({
            success: true,
            message: "welcome back",
            token,
            refreshToken
        })


    //external error
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "500 external error"
        })
    }
})



AuthController.post("/token", async (req, res) => {
    const { refreshToken } = req.body
    const getRefreshToken = await UserModel.findOne({ refreshToken: refreshToken })

    jwt.verify(getRefreshToken.refreshToken, process.env.REFRESH_TOKEN)

    const newToken = generateToken({
        id: getRefreshToken._id,
        username: getRefreshToken.username
    })

    res.json({
        success: true,
        message: "token refreshed",
        newToken
    })
})


//Logout route
AuthController.delete("/logout", verifyToken, async (req, res) => {
    try {
        const deleteToken = await UserModel.findOneAndUpdate({ _id: req.userId }, {
            refreshToken: ""
        })
        
        res.json({
            success: true,
            message: "back to guest mode",
            token: deleteToken.refreshToken
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: "false",
            message: "500 external server"
        })
    }
})

module.exports = AuthController
