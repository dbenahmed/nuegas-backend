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

router.route('/all').get(getAllProjectTasks)

router.route('/:id').get(getSingleTask)

router.route('/create').post(createNewTask)

router.route('/:id/update').patch(updateTask)

router.route('/:id/delete').delete(deleteTask)

router.route('/:id/running').delete(getRunningTasks)

router.route('/:id/upcoming').delete(getUpcomingTasks)

router.route('/:id/today').delete(getTodayTasks)



module.exports = router