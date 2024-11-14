const { Schema, model } = require("mongoose");

const projectSchema = new Schema({
    name: { type: String },
    dueDate: { type: Date },
    deadlineDate: { type: Date },
    parentProjects: { type: [String], default: [] },
    createdAt: { type: Date, immutable: true, default: Date.now },
    createdBy: { type: String, immutable: true, required: true },
    updatedAt: { type: Date, default: Date.now() }
})

const Projects = model('Projects', projectSchema)
module.exports = Projects 