const { Schema, model, Types } = require('mongoose')

const commentSchema = new Schema({
    content: {
        type: String,
        maxLength: [280, 'comment should have a length that is less or equal to 280'],
        required: true,
        match: [/^[a-zA-Z0-9\s-]+$/, 'name must not contain special characters beside -'],
        trim: true,
    },
    parent: {
        parentType: {
            type: String,
            enum: ['project', 'task'],
            required: true,
            immutable:true
        },
        parentId: {
            type: Types.ObjectId,
            trim: true,
            required: true,
            immutable:true
        }
    },
    createdBy: { type: Types.ObjectId, required: true, immutable: true, trim: true, },
    createdAt: { type: Date, default: Date.now(), immutable: true },
    updatedAt: { type: Date, default: Date.now() }
}, {
    methods: {
        updateContent(newContent) {
            this.content = newContent
        },
        updateUpdatedAt(date) {
            this.updatedAt = date
        }
    }
})

module.exports = model('Comments', commentSchema)