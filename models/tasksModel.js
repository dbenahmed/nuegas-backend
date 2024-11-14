const { Schema, model } = require('mongoose')

const taskSchema = new Schema({
    name: { type: String },
    dueDate: { type: Date }
    , deadlineDate: { type: Date },
    parentProjects: {
        type: [String],
        default: []
    },
    priority: { type: String },
    status: {
        type: String,
        required: true
    },
    assignee: { type: [String] },
    createdAt: {
        type: Date,
        default: Date.now(),
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
})


module.exports = model('Tasks', taskSchema)