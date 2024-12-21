const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const {
    registerNewUser,
    userLogin,
    removeUser,
    updateUserData,
    getUserData,
    removeProfilePicture,
    userLogout,
} = require('../controllers/usersController')
const Users = require('../models/usersModel')
const {verifyJWT} = require('../middleware/authMiddleware.js')

const router = express.Router()


// CREATE A NEW USER
router.route('/register').post(registerNewUser)

// USER LOGIN
router.route('/login').post(userLogin)

// USER LOGOUT
router.route('/logout').post(verifyJWT, userLogout)

// USER DELETE
router.route('/:userId').delete(removeUser)

// UPDATE USER NAME/DISPLAY NAME/EMAIL/...
router.route('/update').patch(updateUserData)

// DELETE PROFILE PICTURE
router.route('/profile-picture/remove').delete(removeProfilePicture)

// GET USER DATA
router.route('/:userId').get(getUserData)

module.exports = router