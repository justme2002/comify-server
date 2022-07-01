const mongoose = require('mongoose');

const Schema = mongoose.Schema
const AdminModel = mongoose.model("admin", new Schema({
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
    }
}))

module.exports = AdminModel