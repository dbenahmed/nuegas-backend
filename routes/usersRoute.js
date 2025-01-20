const express = require('express')
const {body} = require('express-validator');
const Users = require("../models/usersModel")
const {
    registerNewUser,
    userLogin,
    removeUser,
    updateUserData,
    getUserData,
    removeProfilePicture,
    userLogout,
} = require('../controllers/usersController')
const {verifyJWT} = require('../middleware/authMiddleware.js')

const router = express.Router()

// CREATE A NEW USER
router.route('/register').post(
    body('email')
        .isEmail()
        .normalizeEmail(),
    body('username')
        .notEmpty().withMessage('Username is required')
        .isLength({min: 6, max: 16}).withMessage('Username must be between 3 and 30 characters').trim()
        .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username must contain only letters and numbers'),
    body('displayName')
        .isString()
        .matches(/^[a-zA-Z0-9 ]+$/),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({min: 8}).withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    registerNewUser
)


// USER LOGIN
// todo : split this route and customize the validators
router.route('/login').post(
    body('type').notEmpty().withMessage('Loggin type is required'),
    /*body('email')
        .isEmail()
        .normalizeEmail(),*/
    body('username')
        .notEmpty().withMessage('Username is required')
        .isLength({min: 6, max: 16}).withMessage('Username must be between 3 and 30 characters').trim()
        .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username must contain only letters and numbers'),
    userLogin)

// USER LOGOUT
router.route('/logout').post(
    body('userId').notEmpty().withMessage('Loggin userId is required'),
    verifyJWT, userLogout)

// USER DELETE
router.route('/:userId').delete(
    body('userId').notEmpty().withMessage('Loggin userId is required'),
    verifyJWT, removeUser)

// UPDATE USER NAME/DISPLAY NAME/EMAIL/...
router.route('/update').patch(
    body('type')
        .notEmpty().withMessage('Data type that wants to be changed should not be empty'),
    verifyJWT, updateUserData)

// DELETE PROFILE PICTURE
router.route('/profile-picture/remove').delete(
    body('userId').notEmpty().withMessage('Loggin userId is required'),
    verifyJWT, removeProfilePicture)

// GET USER DATA
router.route('/:userId').get(
    body('userId').notEmpty().withMessage('Loggin userId is required'),
    verifyJWT, getUserData)

module.exports = router