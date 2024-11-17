const { Schema, model, Types } = require("mongoose");

const taskSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 16,
        match: /^[A-Za-z0-9 ]+$/
    },
    dueDate: { type: Date },
    deadlineDate: { type: Date },
    parentProjects: {
        type: [Types.ObjectId],
        default: [],
        required: true,
    },
    priority: {
        type: String,
        enum: {
            values: ["urgent", "high", "medium", "low", "no-priority"],
            message: (v) => `${v} should be [high,low,medium,no-priority,urgent]`,
        },
        required: true,
        default: "no-priority",
        trim: true,
    },
    status: {
        type: String,
        required: true,
        default: 'backlog',
        trim: true,
        enum: {
            values: ["todo", "done", "doing", "cancelled", "backlog", "in-review"],
            message: (v) => {
                return `${v} should be either [done,doing,in-review,cancelled,backlog,todo]`;
            },
        },
    },
    assignee: { type: [Types.ObjectId] },
    createdAt: {
        type: Date,
        default: Date.now(),
        immutable: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = model("Tasks", taskSchema);
