const { Schema } = require('mongoose')
const mongoose = require('mongoose')

const tasksSchema = new Schema({
    name: {
        type: String
    },
    dueDate: {

    },
    deadlineDate: {

    },
    parentProjects: {

    },
    priority: {

    },
    status: {

    },
    assignee: {

    },
    createdAt: {

    },
    updatedAt: {

    }
})