//import module
const mongoose = require('mongoose');

//init schema
const Schema = mongoose.Schema

//model declaration
const UserModel = mongoose.model("user", new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true
        },

        refreshToken: {
            type: String,
        },

        likedPost: [
            {
                type: Schema.Types.ObjectId,
                ref: "comic"
            }
        ],

        commentPost: [
            {
                type: Schema.Types.ObjectId,
                ref: "comic"
            }
        ]
    }
))

//export module
module.exports = UserModel