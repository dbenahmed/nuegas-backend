const {body, param} = require('express-validator')
const {verifyJWT} = require("../middleware/authMiddleware");

const express = require('express')
const router = express.Router()

router.route('/update').patch()
router.route('/remove').delete()
router.route('/').get()
router.route('/members/add').post()
router.route('/members/remove').delete()
// _________ CONTROLLERS _____________
const {
    createProject,
    updateProject,
} = require("../controllers/projectsControllers");

router.route('/create').post(
    body('name')
        .trim()
        .isString().withMessage('name must be a string')
        .notEmpty().withMessage('name must not be empty')
        .isLength({min: 2, max: 55}).withMessage('name must be greater than 5 characters less than 55')
        .matches(/^[a-zA-Z0-9\s-]+$/).withMessage('name must be contain only letters and characters and -')
        .escape(),
    body('members')
        .isArray().withMessage('members must be an array'),
    body('members.*')
        .trim()
        .escape()
        .isString().withMessage('each member must be a string')
        .notEmpty().withMessage('each member must not be empty'),
    body('description')
        .trim()
        .isString().withMessage('description must be a string')
        .escape(),
    body('deadlineDate')
        .isISO8601().withMessage('deadlineDate should be of type date ISO8601')
        .toDate()
        .optional({values: "null"}),
    verifyJWT,
    createProject
)
router.route('/members').get()

module.exports = router