const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const {validationResult} = require('express-validator');
const Projects = require("../models/projectsModel");
const Users = require("../models/usersModel");
const createProject = async (req, res, next) => {
    try {
        // verify validation and sanitization
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new ApiError(400, 'Validation Error', [], errors.array())
        }
        // get project data
        const {
            name,
            members,
            deadlineDate,
            description
        } = req.body
        const userId = req.userId.toString()
        // create the project and add the creator as a member
        // verify if all the members do exist in the database
        await Promise.all(members.map(async (memberId) => {
            const memberExists = await Users.findById(memberId)
            if (!memberExists) {
                throw new ApiError(400, 'the member you want to add does not exist')
            }
        })).catch(err => {
            throw (err)
        })
        // todo : verify the deadline date is later than today ( look for bugs ) there must be a bug in here
        const deadlineDateIsAfterToday = (deadlineDate.getTime() > Date.now())
        if (!deadlineDateIsAfterToday) {
            throw new ApiError(409, 'Deadline date must be later than today')
        }
        const projectCreated = Projects.create({
            name,
            members,
            deadlineDate,
            description,
            createdBy: userId,
        })
        const apiResponse = new ApiResponse(202, 'Project created successfully', projectCreated, true)
        res.json(apiResponse).status(apiResponse.successCode)
    } catch (err) {
        next(err)
    }
}

