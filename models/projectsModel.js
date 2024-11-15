const { Schema, model } = require("mongoose");
const { stringIsUndefined: stringIsUndefined, stringDoesNotContainSpecialCharacters: stringDoesNotContainSpecialCharacters } = require('../validators/stringValidators')
const { arrayNotEmpty: arrayNotEmpty } = require('../validators/arrayValidators')
const { dateIsADate: dateIsADate } = require('../validators/dateValidators')

// SSSetter functions
function setProjectName(v) {
    // if name is empty give it a random name 
    if (v) {
        return v
    } else {
        const taskNumber = this.projectTasks.length + 1
        return `Task-${taskNumber}`
    }
}
function setCreatorAsProjectMember() {
    return this.createdBy
}


// Project Schema
const projectSchema = new Schema({
    name: {
        type: String, set: setProjectName,
        minLength: 2,
        maxlength: 55,
        match: [/^[a-zA-Z0-9\s-]+$/, 'name must not contain special characters beside -'],
        trim: true,
    },
    deadlineDate: { type: Date },
    createdAt: { type: Date, immutable: true, default: Date.now },
    projectTasks: { type: [String], default: [] },
    members: {
        type: [String], required: true, set: setCreatorAsProjectMember,
        validate: [{
            validator: (v) => { return arrayNotEmpty(v) },
            message: 'Project members are set to empty ( impossible please ad one user to the project '
        }, {
            validator: (v) => { return !stringIsUndefined(v) },
            message: 'User you want to add is undefined'
        }]
    },
    description: {
        type: String, default: '', trim: true,
        // todo : SANITIZATION

    },
    createdBy: { type: String, immutable: true, required: true },
    updatedAt: { type: Date, default: Date.now() }
}, {
    methods: {
        changeName(newName) {
            this.name = newName
        }, async changeDeadlineDate(newDate) {
            try {
                if (!dateIsADate(newDate)) { throw ('the given date is not a Date Variable') }
                this.deadlineDate = newDate
            } catch (e) {
                console.log(e)
            }
        }, addTaskIdToProject(taskId) {
            this.projectTasks.push(taskId)
        }, async removeTaskFromProject(taskId) {
            try {
                if (!this.projectTasks.includes(taskId)) { throw ('task does not exist in database') }
                this.projectTasks.splice(taskId, 1)
            } catch (e) {
                console.log(e)
            }
        }, addMember(memberId) {
            this.members.push(memberId)
        }, removeMember(memberId) {
            const index = this.members.findIndex(memberId)
            this.members.splice(index, 1)
        }, updateUpdatedAt(date) {
            this.updatedAt = date
        }, updateDescription(newDesc) {
            this.description = newDesc
        }
    }
})

const Projects = model('Projects', projectSchema)
module.exports = Projects 