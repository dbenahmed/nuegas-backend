const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Users = require('../models/usersModel')
const { registerNewUser,
    userLogin,
    removeUser,
    updateUserData,
    getUserData,
    removeProfilePicture,
} = require('../controllers/usersController')

const router = express.Router()


// CREATE A NEW USER
router.route('/register').post(registerNewUser)


// USER LOGIN
router.route('/login').post(userLogin)

// USER DELETE
router.route('/:userId').delete(removeUser)

// UPDATE USER NAME/DISPLAY NAME/EMAIL/...
router.route('/:userId/:type').patch(updateUserData)

// DELETE PROFILE PICTURE
router.route('/:userId/profile-picture').delete(removeProfilePicture)

// GET USER DATA
router.route('/:userId').get(getUserData)

module.exports = router