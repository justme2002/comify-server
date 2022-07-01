const mongoose = require('mongoose');


const connectDB = async () => {
    try {
        await mongoose.connect(`mongodb+srv://justme1092002:huy2002109@comiccluster.e5f6p.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })

        console.log(`connected to mongoDB`)
    } catch (error) {
        console.log(error)
    }
}

module.exports = connectDB