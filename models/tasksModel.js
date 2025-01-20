const { Schema, model, Types } = require("mongoose");

const taskSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 64,
        match: /^[A-Za-z0-9 ]+$/,
        minLength: 1,
    },
    dueDate: { type: Date },
    deadlineDate: { type: Date },
    parentProject: {
        type: Types.ObjectId, default: null
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
    assignees: { type: [Types.ObjectId] },
    createdBy: {
        type: Types.ObjectId,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        immutable: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
    archive: {
        type: Boolean,
        default: false,
        required: true
    }
}, {
    methods: {
        updateName(newName) {
            this.name = newName
        },
        updateDuedate(newDate) {
            this.dueDate = newDate
        },
        updateDeadlineDate(newD) {
            this.deadlineDate = newD
            return { success: true }
        }, updateParentProject(projId) {
            const toObjId = mongoose.Types.ObjectId(projId)
            this.parentProject = toObjId
            return { success: true }
        }, updatePriority(newP) {
            this.priority = newP
            return { success: true }
        }, updateStatus(newS) {
            this.status = newS
            return { success: true }
        }, addAssignee(newAssigneeId) {
            const toObjId = mongoose.Types.objectId(newAssigneeId)
            const ind = this.assignees.findIndex(v => v === toObjId)
            if (ind !== -1) {
                return { success: false, message: 'assignee already exists' }
            }
            this.assignees.push(toObjId)
            return { success: true }
        }, removeAssignee(assigneeId) {
            const ind = this.assignees.findIndex(v => v === assigneeId)
            if (ind === -1) { return { success: false, message: 'assignee does not exist' } }
            this.assignees.splice(ind, 1)
            return { success: true }
        }, updateUpdatedAt(newD) {
            this.updatedAt = newD
        }
    }
});


module.exports = model("Tasks", taskSchema);
