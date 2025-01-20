const {sendResponse} = require('./functions/sendResponse')
const Tasks = require('../models/tasksModel')
const Users = require('../models/usersModel')
const Projects = require('../models/projectsModel')
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const {validationResult} = require('express-validator')

const getAllProjectTasks = async (req, res, next) => {
    try {
        // Validate given data types checking was successful
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validation Error', [], errors.array())
        }
        const {
            projectId
        } = req.params
        // verify if given project id do exist
        const projectExists = await Projects.exists({_id: projectId})
        if (!projectExists) {
            throw new ApiError(404, 'Project does not exist');
        }
        const foundTasks = await Tasks.find({parentProject: projectId})
        if (!foundTasks) {
            throw new ApiError(404, 'Error while retrieving tasks')
        }
        const apiResponse = new ApiResponse(200, 'Tasks found successfully.', foundTasks, true)
        res.status(apiResponse.statusCode).json(apiResponse)
    } catch (err) {
        next(err)
    }

}

const getSingleTask = async (req, res, next) => {
    try {
        // Validate given data types checking was successful
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validation Error', [], errors.array())
        }
        const {
            taskId,
        } = req.params
        // search for the element based on the selected search type
        const foundTask = await Tasks.findById(taskId)
        if (!foundTask) {
            throw new ApiError(404, `Task with this id not found`)
        }
        const apiResponse = new ApiResponse(200, 'Task found successfully.', foundTask, true)
        res.status(apiResponse.statusCode).json(apiResponse)
    } catch (err) {
        next(err)
    }
}

const createNewTask = async (req, res, next) => {
    try {
        // Validate given data types checking was successful
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validation Error', [], errors.array())
        }

        const {
            name,
            dueDate,
            deadlineDate,
            parentProject,
            priority,
            status,
            assignees,
            userId
        } = req.body
        // validate if the Assignees Id's ( users ) do exist in our users database
        const userExists = await Users.findById(userId)
        if (!userExists) {
            throw new ApiError(404, `User Creating this task with this id not found`)
        }

        // todo verify if dueDate is before today or deadline date is before dueDate
        /*const deadlineDateIsNotBeforeToday = (deadlineDate.getTime() > Date.now())
        if (!deadlineDateIsNotBeforeToday) {
            throw new ApiError(409,'Deadline date must be later than today')
        }*/

        // verify if assignees Id's exist
        const resolved = await Promise.all(assignees.map(async (assignee) => {
            const userFd = await Users.exists({_id: assignee})
            console.log('assignee', userFd)
            if (!userFd) {
                throw new ApiError(404, 'some of the Assignees Id`s are not found')
            }
        })).catch((err) => {
            throw (err)
        })
        const task = Tasks.create({
            name,
            dueDate,
            deadlineDate,
            parentProject,
            priority,
            status,
            assignees,
            createdBy: userId
        })
        // todo: still task.save()
        const apiResponse = new ApiResponse(201, 'Tasks created successfully.', task, true)
        res.status(apiResponse.statusCode).json(apiResponse)
    } catch (err) {
        next(err)
    }
}

const updateTask = async (req, res, next) => {
    try {
        // Validate given data types checking was successful
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validation Error', [], errors.array())
        }
        /*const {
            taskId,
            name,
            dueDate,
            deadlineDate,
            parentProject,
            priority,
            status,
            assignees,
        } = req.body*/
        const {taskId, ...newUpdates} = req.body

        /*// GET ONLY NULL OR NOT UNDEFINED ELEMENTS
        // NULL = THE USER CHANGE THE TASK PROPERTY INTO EMPTY
        // "" (EMPTY STRING) = THE USER DID NOT CHANGE THIS PROPERTY ( KEEP THE PREVIOUS VALUE )
        const filteredOnlyValidProperties = Object.fromEntries(Object.entries(
            {
                name,
                dueDate,
                deadlineDate,
                parentProject,
                priority,
                status,
                assignees,
            }
        ).filter(([key, value], i) => (value !== "" && value !== undefined)))
        console.log('filtered props', filteredOnlyValidProperties)
        const foundTask = await Tasks.findByIdAndUpdate(taskId, {...filteredOnlyValidProperties})
        */

        // todo : what if the dueDate was set to a day before today or the deadline date was set to a date before today or before dueDate

        const foundTask = await Tasks.findByIdAndUpdate(taskId, {...newUpdates})
        if (!foundTask) {
            throw new ApiError(404, 'Task with this id not found')
        }
        const apiResponse = new ApiResponse(200, 'Task updated successfully.', foundTask, true)
        res.status(apiResponse.statusCode).json(apiResponse)
    } catch (err) {
        next(err)
    }
}

const deleteTask = async (req, res, next) => {
    try {
        // Validate given data types checking was successful
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validation Error', [], errors.array())
        }
        const {
            taskId
        } = req.params
        const foundTask = await Tasks.findById(taskId)
        if (!foundTask) {
            throw new ApiError(404, 'Task not found')
        }
        foundTask.archive = true
        await foundTask.save()
        const apiRespomse = new ApiResponse(200, 'Task deleted successfully.', {}, true)
        res.status(apiRespomse.statusCode).json(apiRespomse)
    } catch (err) {
        next(err)
    }
}

const getRunningTasks = async (req, res, next) => {

}

const getUpcomingTasks = async (req, res, next) => {
    try {
        // Validate given data types checking was successful
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validation Error', [], errors.array())
        }
        const {
            type,
            userId,
        } = req.params
        let startDate = new Date()
        let endDate = new Date()
        switch (type) {
            case 'week':
                // starting from today to the end of that week
                endDate.setDate(startDate.getDate() + 6)
                break;
            case 'month':
                // starting from today to the end of the month
                endDate.setDate(startDate.getDate() + 31)
                break;
            case 'tomorrow':
                endDate.setDate(startDate.getDate() + 1)
                break;
        }
        console.log(endDate.toISOString())
        /* const foundTasks = await Tasks.find({
            $and: [
                {
                    $or: [
                        { assignees: userId },
                        { createdBy: userId }
                    ]
                },
                {
                    dueDate: {
                        $gte: nextWeekStart,
                        $lte: nextWeekEnd
                    }
                }
            ]
        }) */
        const foundTasks = await Tasks.find({
            $and: [
                {
                    $or: [
                        {assignees: userId},
                        {createdBy: userId}
                    ]
                },
                {
                    dueDate: {
                        $gte: startDate,
                        $lt: endDate
                    }
                }
            ]
        })
        const apiResponse = new ApiResponse(200, 'Task found successfuly.', foundTasks, true)
        res.status(apiResponse.statusCode).json(apiResponse)
    } catch (err) {
        next(err)
    }
}

const getTodayTasks = async (req, res, next) => {
    try {
        // Validate given data types checking was successful
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validation Error', [], errors.array())
        }
        const {
            userId,
        } = req.params
        const todayDate = new Date()
        const foundTasks = await Tasks.find({
            $and: [
                {
                    $or: [
                        {assignees: userId},
                        {createdBy: userId}
                    ]
                },
                {
                    dueDate: todayDate
                }
            ],
        })
        const apiResponse = new ApiResponse(200, 'Task found successfuly.', foundTasks, true)
        res.status(apiResponse.statusCode).json(apiResponse)
    } catch (err) {
        next(err)
    }
}


module.exports = {
    getAllProjectTasks,
    getSingleTask,
    createNewTask,
    updateTask,
    deleteTask,
    getRunningTasks,
    getUpcomingTasks,
    getTodayTasks,
}
