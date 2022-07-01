//import module
const mongoose = require('mongoose');

//init schema
const Schema = mongoose.Schema

//model declaration
const CategoryModel = mongoose.model("category", new Schema({
        category: {
            type: String,
            required: true,
            unique: true
        },

        comic: [
            {
                type: Schema.Types.ObjectId,
                ref: "comic"
            }
        ]
    }  
))


//export module
module.exports = CategoryModel