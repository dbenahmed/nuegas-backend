const {Schema, model, Types} = require("mongoose");
const {
    stringIsUndefined: stringIsUndefined,
    stringDoesNotContainSpecialCharacters: stringDoesNotContainSpecialCharacters
} = require('../utils/stringValidators')
const {arrayNotEmpty: arrayNotEmpty} = require('../utils/arrayValidators')
const {dateIsADate: dateIsADate} = require('../utils/dateValidators')


function arrayContainUndefined(v) {
    if (!Array.isArray(v)) {
        return false
    }
    const containUndefined = v.findIndex((v) => v === undefined)
    if (containUndefined === -1) {
        return false
    } else {
        return true
    }
}

// Project Schema
const projectSchema = new Schema({
    name: {
        type: String,
        minLength: 2,
        maxlength: 55,
        match: [/^[a-zA-Z0-9\s-]+$/, 'name must not contain special characters beside -'],
        trim: true,
    },
    deadlineDate: {type: Date, default: undefined},
    createdAt: {type: Date, immutable: true, default: Date.now},
    projectTasks: {type: [Types.ObjectId], default: []},
    members: {
        type: [Types.ObjectId],
        validate: [{
            validator: (v) => !arrayContainUndefined(v),
            message: `the members array contains undefined values`
        }]
    },
    description: {
        type: String, default: '', trim: true,
    },
    createdBy: {type: Types.ObjectId, immutable: true, required: true},
    updatedAt: {type: Date, default: Date.now()}
}, {
    methods: {
        changeName(newName) {
            this.name = newName
        }, async changeDeadlineDate(newDate) {
            try {
                if (!dateIsADate(newDate)) {
                    throw ('the given date is not a Date Variable')
                }
                this.deadlineDate = newDate
            } catch (e) {
                console.log(e)
            }
        }, addTaskIdToProject(taskId) {
            this.projectTasks.push(taskId)
        }, async removeTaskFromProject(taskId) {
            try {
                if (!this.projectTasks.includes(taskId)) {
                    throw ('task does not exist in database')
                }
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