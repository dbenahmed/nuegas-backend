const { Schema, model } = require('mongoose')
const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    parentProject: { type: String, required: true },
    parentTask: { type: String, required: true },
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now(), immutable: true },
    updatedAt: { type: Date, default: Date.now() }
})

module.exports = model('Comments', commentSchema)