const { sendResponse } = require('./functions/sendResponse')
const Tasks = require('../models/tasksModel')
const getAllProjectTasks = async (req, res) => {
    try {
        const {
            projectId
        } = req.params
        const foundTasks = await Tasks.find({ parentProject: projectId })
        sendResponse(true, foundTasks, 202, [], res)
    } catch (e) { sendResponse(false, e, 404, undefined, res) }
}

const getSingleTask = async (req, res) => {
    try {
        const {
            taskId,
            name,
            type
        } = req.params
        const typeEnum = ['name', 'id']
        // check if the search type is a valid type of search
        const typeIsInEnum = typeEnum.includes(type)
        if (!typeIsInEnum) { throw (`${type} is invalid item to search by`) }
        // search for the element based on the selected search type 
        let foundTask
        if (type === 'id') {
            foundTask = await Tasks.findById(taskId)
        } else if (type === 'name') {
            foundTask = await Tasks.findOne({ name: name })
        }
        sendResponse(true, foundTask, 202, [], res)
    } catch (e) { sendResponse(false, e, 404, undefined, res) }
}

const createNewTask = async (req, res) => {
    try {
        const {
            name,
            dueDate,
            deadlineDate,
            parentProject,
            priority,
            status,
            assignees,
        } = req.body
        // TRANSFORMING THE DATE INSIDE THE JSON FROM A STRING INTO A DATA VARIABLE
        const dueDateDate = Date.parse(dueDate)
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
        const task = new Tasks({
            ...filteredOnlyValidProperties
        })
        // todo: still task.save()
        sendResponse(true, task, 202, undefined, res)
    } catch (e) { sendResponse(false, e, 404, undefined, res) }
}

const updateTask = async (req, res) => {
    try {
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
        if (dueDate === "") { dueDateDate = "" } else { dueDateDate = Date.parse(dueDate) }

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
        const foundTask = await Tasks.findByIdAndUpdate(taskId, { ...filteredOnlyValidProperties })
        if (!foundTask) { throw ('Task not found') }
        sendResponse(true, foundTask, 202, undefined, res)
    } catch (e) { sendResponse(false, e, 404, undefined, res) }
}

const deleteTask = async (req, res) => {
    try {
        const {
            taskId
        } = req.body
        const foundTask = await Tasks.findById(taskId)
        if (!foundTask) { throw ('task not found') }
        foundTask.archive = true
        sendResponse(true, foundTask, 202, undefined, res)
    } catch (e) { sendResponse(false, e, 404, undefined, res) }
}

const getRunningTasks = async (req, res) => {

}

const getUpcomingTasks = async (req, res) => {
    try {
        const {
            type,
            userId,
        } = req.params

        const typeEnum = ['week', 'month', 'tommorow']
        const typeIsInEnum = typeEnum.includes(type)
        if (!typeIsInEnum) { throw (`${type} is not a valid type of search`) }
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
                        { assignees: userId },
                        { createdBy: userId }
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
    } catch (e) { sendResponse(false, e, 404, undefined, res) }
}

const getTodayTasks = async (req, res) => {
    try {
        const {
            userId,
        } = req.params
        const todayDate = new Date()
        const foundTasks = await Tasks.find({
            dueDate: todayDate
        })
        sendResponse(true, 'Tasks Searching Successful', 202, foundTasks, res)
    } catch (e) { sendResponse(false, e, 404, undefined, res) }
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
