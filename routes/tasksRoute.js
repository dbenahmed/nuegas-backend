const mongoose = require('express')
const Tasks = require('../models/tasksModel')

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

router.route('/project/:projectId/tasks').get(getAllProjectTasks)

router.route('/:id').get(getSingleTask)

router.route('/create').post(createNewTask)

router.route('/update').patch(updateTask)

router.route('/delete').delete(deleteTask)

router.route('/:id/running').get(getRunningTasks)

router.route('/:userId/upcoming/:type').get(getUpcomingTasks)

router.route('/:id/today').get(getTodayTasks)



module.exports = router