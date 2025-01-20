const {sendResponse} = require('./functions/sendResponse')
const Tasks = require('../models/tasksModel')
const Users = require('../models/usersModel')
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
        const foundTasks = await Tasks.find({parentProject: projectId})
        if (!foundTasks) {
            throw new ApiError(404, 'Error while retrieving tasks')
        }
        const apiResponse = new ApiResponse(202, 'Tasks found successfully.', {...foundTasks}, true)
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
            name,
            type
        } = req.params
        const typeEnum = ['name', 'id']
        // check if the search type is a valid type of search
        const typeIsInEnum = typeEnum.includes(type)
        if (!typeIsInEnum) {
            throw new ApiError(404, `${type} is invalid item to search by`)
        }
        // search for the element based on the selected search type 
        let foundTask
        if (type === 'id') {
            foundTask = await Tasks.findById(taskId)
        } else if (type === 'name') {
            foundTask = await Tasks.findOne({name: name})
        }
        if (!foundTask) {
            throw new ApiError(404, `Task with this id not found`)
        }
        const apiResponse = new ApiResponse(202, 'Task found successfully.', {...foundTask}, true)
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
        } = req.body
        // validate if the Assignees Id's ( users ) do exist in our users database
        const resolved = await Promise.all(assignees.map(async (assignee) => {
            const userFd = await Users.exists({_id: assignee})
            console.log('assignee', userFd)
            if (!userFd) {
                throw new ApiError(404, 'some of the Assignees Id`s are not found')
            }
        })).catch((err) => {
            throw (err)
        })
        const task = new Tasks({
            name,
            dueDate,
            deadlineDate,
            parentProject,
            priority,
            status,
            assignees,
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
        const {
            taskId,
            name,
            dueDate,
            deadlineDate,
            parentProject,
            priority,
            status,
            assignees,
        } = req.body
        // TRANSFORMING THE DATE INSIDE THE JSON FROM A STRING INTO A DATA VARIABLE
        let dueDateDate
        if (dueDate === "") {
            dueDateDate = ""
        } else {
            dueDateDate = Date.parse(dueDate)
        }

        // GET ONLY NULL OR NOT UNDEFINED ELEMENTS
        // NULL = THE USER CHANGE THE TASK PROPERTY INTO EMPTY
        // "" (EMPTY STRING) = THE USER DID NOT CHANGE THIS PROPERTY ( KEEP THE PREVIOUS VALUE )
        const filteredOnlyValidProperties = Object.fromEntries(Object.entries(
            {
                name,
                dueDate: dueDateDate,
                deadlineDate,
                parentProject,
                priority,
                status,
                assignees,
            }
        ).filter(([key, value], i) => value !== ""))
        console.log('filtered props', filteredOnlyValidProperties)
        const foundTask = await Tasks.findByIdAndUpdate(taskId, {...filteredOnlyValidProperties})
        if (!foundTask) {
            throw ('Task not found')
        }
        sendResponse(true, foundTask, 202, undefined, res)
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
        } = req.body
        const foundTask = await Tasks.findById(taskId)
        if (!foundTask) {
            throw ('task not found')
        }
        foundTask.archive = true
        sendResponse(true, foundTask, 202, undefined, res)
    } catch (e) {
        sendResponse(false, e, 404, undefined, res)
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

        const typeEnum = ['week', 'month', 'tommorow']
        const typeIsInEnum = typeEnum.includes(type)
        if (!typeIsInEnum) {
            throw (`${type} is not a valid type of search`)
        }
        const startDate = new Date()
        const endDate = new Date()
        endDate.setDate(startDate.getDate() + 7)
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
        sendResponse(true, 'Tasks Searching Successful', 202, foundTasks, res)
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
            dueDate: todayDate
        })
        sendResponse(true, 'Tasks Searching Successful', 202, foundTasks, res)
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
