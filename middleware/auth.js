const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next) => {
    const authHeader = req.header("authorization")
    const token = authHeader && authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN)
        req.userId = decoded.id
        console.log(decoded)

        next()
    } catch (error) {
        console.log(error)
    }

}

module.exports = verifyToken