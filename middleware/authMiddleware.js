const jwt = require('jsonwebtoken')
require('dotenv').config()
const Users = require('../models/usersModel.js')
const ApiError = require('../utils/ApiError.js')
const ApiResponse = require('../utils/ApiResponse.js')

const verifyJWT = async function (req, res, next) {
    try {
        // get the token from either authorizatoin bearer
        // or get it from the cookies
        const token = req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1]
        // verify if token is valid
        if (!token) {
            throw new ApiError(401, 'No token provided')
        }
        // decode the token to gather user data
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // verify user exists
        const user = await Users.findById(decodedToken._id).select('-passwordHash -refreshToken')
        // if user does not exist ( invalid token )
        if (!user) {
            throw new ApiError(401, 'Invalid Token User not found')
        }
        // if user do exist
        req.user = user
        req.userId = user._id
        next()
    } catch (e) {
        if (!Number.isInteger(e.statusCode)) {
            res.statusCode(500).json({
                success: false, message: `${e.statusCode} is not a number`
            })
        }
        res.statusCode(e.statusCode).json(e)
    }
}

module.exports = {verifyJWT}