// Req jwt
const jwt = require("jsonwebtoken")

// Config
require("dotenv").config()

const JWT_SECRET = process.env.JWT_SECRET ?? "jwt_secret"

exports.generateToken = function(userId){
    return jwt.sign({id: userId}, JWT_SECRET, {expiresIn: "7d"})
}

exports.verifyToken = function(token){
    return jwt.verify(token, JWT_SECRET)
}