const mongoose = require('express')
const {body} = require('express-validator')
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

const router = mongoose.Router()

router.route('/project/:projectId/tasks').get(
    getAllProjectTasks)

router.route('/:id').get(getSingleTask)

router.route('/create').post(
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isString().withMessage('Name must be a string')
        .isLength({min: 1, max: 16})
        .matches(/^[a-z0-9 ]+$/)
        .escape(),
    body('dueDate')
        .optional({values: 'null'})
        .notEmpty().withMessage('DueDate is required')
        .isISO8601().withMessage('DueDate should be of type date ISO8601')
        .toDate(),
    body('deadlineDate')
        .optional({values: 'null'})
        .notEmpty().withMessage('Deadline Date is required')
        .isISO8601().withMessage('Deadline Date should be of type date ISO8601')
        .toDate(),
    body('parentProject')
        .optional({values: 'null'})
        .trim(),
    body('priority')
        .notEmpty().withMessage('Priority is required')
        .isString().withMessage('Priority must be a string')
        .trim()
        .isIn(['low', 'medium', 'high', 'urgent', 'no-priority']).withMessage('Priority must be one of: low, medium, high, urgent'),
    body('status')
        .trim()
        .isString().withMessage('Status is required')
        .isIn(["todo", "done", "doing", "cancelled", "backlog", "in-review"]).withMessage('Status must be one of: todo, done, doing, cancelled, backlog, in-review'),
    body('assignees')
        .isArray().withMessage('Assignees is not an array'),
    body('assignees.*')
        .escape()
    , createNewTask
)

router.route('/update').patch(updateTask)

router.route('/delete').delete(deleteTask)

router.route('/:id/running').get(getRunningTasks)

router.route('/:userId/upcoming/:type').get(getUpcomingTasks)

router.route('/:id/today').get(getTodayTasks)


module.exports = router