const express = require('express')
const {body, param} = require('express-validator')

// importing controllers
const {
    getAllProjectTasks,
    getSingleTask,
    createNewTask,
    updateTask,
    deleteTask,
    getRunningTasks,
    getUpcomingTasks,
    getTodayTasks,
} = require('../controllers/tasksControllers')

// importing validators
const {
    getUserIdValidator,
    getNameValidator,
    getDueDateValidator,
    getDeadlineDateValidator,
    getPriorityValidator,
    getStatusValidator,
    getParentProjectValidator,
    getAssigneesValidator,
} = require("./tasksValidations");
const {verifyJWT} = require("../middleware/authMiddleware");


const router = express.Router()

// __________________ ROUTES ______________________
router.route('/project/:projectId/tasks').get(
    verifyJWT,
    param('projectId')
        .trim()
        .isString().withMessage('Project id is not a string')
        .escape(),
    getAllProjectTasks)

/*router.route('/:taskId').get(
    param('taskId')
        .trim()
        .notEmpty().withMessage('taskId must not be empty')
        .isString().withMessage('Task id is not a string')
        .escape(),
    getSingleTask)*/

router.route('/create').post(
    verifyJWT,
    getUserIdValidator(false), // userId is required
    getNameValidator(false), // name is required
    getDueDateValidator(true), // dueDate is not required
    getDeadlineDateValidator(true), // deadlineDate is not required
    getPriorityValidator(true), // priority is not required
    getStatusValidator(true), // status is not required
    getParentProjectValidator(true), // parentProject is not required
    getAssigneesValidator(true), // assignees are  not required
    createNewTask
)

router.route('/update').patch(
    verifyJWT,
    // Required field: taskId
    body('taskId')
        .trim()
        .notEmpty().withMessage('taskId must not be empty')
        .isString().withMessage('Task id is not a string')
        .escape(),

    // Optional fields
    getNameValidator(true), // name is optional
    getDueDateValidator(true), // dueDate is optional
    getDeadlineDateValidator(true), // deadlineDate is optional
    getParentProjectValidator(true), // parentProject is optional
    getPriorityValidator(true), // priority is optional
    getStatusValidator(true), // status is optional
    getAssigneesValidator(true), // assignees are optional
    updateTask
)

router.route('/delete/:taskId').delete(
    verifyJWT,
    // Required field: taskId
    param('taskId')
        .trim()
        .notEmpty().withMessage('taskId must not be empty')
        .isString().withMessage('Task id is not a string')
        .escape(),
    deleteTask)

router.route('/:id/running').get(getRunningTasks)

router.route('/upcoming/:type').get(
    verifyJWT,
    param('type')
        .trim()
        .notEmpty().withMessage('type param must not be empty')
        .isString().withMessage('type param must be a string')
        .isIn(['week','month','tomorrow'])
        .escape(),
    getUpcomingTasks)

router.route('/today').get(
    verifyJWT,
    getTodayTasks)


module.exports = router