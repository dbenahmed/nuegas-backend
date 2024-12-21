const jwt = require('jsonwebtoken')
require('dotenv').config()
const Users = require('../models/usersModel.js')

const verifyJWT = async function (req, res, next) {
    try {
        // get the token from either authorizatoin bearer
        // or get it from the cookies
        const token = req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1]
        console.log(token)
        // verify if token is valid
        if (!token) {
            throw ('invalid token')
        }
        // decode the token to gather user data
        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // verify user exists
        const user = await Users.findById(decodedToken._id).select('-passwordHash -refreshToken')
        // if user does not exist ( invalid token )
        if (!user) {
            throw ('invalid token');
        }
        // if user do exist
        req.user = user
        req.userId = user._id
        next()
    } catch (e) {
        res.status(403).send('Unauthorized');
    }
}

module.exports = {verifyJWT}