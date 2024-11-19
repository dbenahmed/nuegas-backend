const bcrypt = require('bcrypt')
const { Schema, model } = require('mongoose')

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        minLength: 6,
        maxLength: 16,
        unique: true,
        trim: true,
        match: [/^[a-zA-Z0-9]+$/, 'please une only letters and numbers and - ']
    },
    passwordHash: {
        type: String,
        required: true,
        unique: true,
    },
    displayName: {
        type: String, required: true, minLength: 6, maxLength: 16, trim: true,
        match: [/^[a-zA-Z0-9]+$/, 'please only use letters and numbers and -']
    },
    email: { type: String, trim: true, lowerCase: true, unique: true },
    profilePicture: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now(), immutable: true },
    updatedAt: { type: Date, default: Date.now() }
}, {
    methods: {
        updateUsername(newUsername) {
            const reg = /^[a-zA-Z0-9]+$/
            const regex = new RegExp(reg)
            const validFormat = regex.test(newUsername)
            if (!validFormat) { return ({ success: false, message: 'new usename has invalid format' }) }
            this.username = newUsername
            return {
                success: true,
                message: 'successfully username updated'
            }
        },
        updatePasswordHash(newPassword) {
            // check the format of the given password if it is acceptable
            const reg = /^(?=.*[a-z])(?=.*[A-Z])[A-Za-z]{8,}$/
            const testReg = new RegExp(reg)
            const validFormat = testReg.test(newPassword)
            if (!validFormat) { return { success: false, message: 'password has unvalid format' } }
            const passwordHash = bcrypt.hashSync((newPassword, 10))
            this.passwordHash = passwordHash
            return ({
                success: true,
                message: 'password updated successfully'
            })
        },
        updateDisplayName(newDisplayName) {
            const reg = /^[a-zA-Z0-9 ]+$/
            const regex = new RegExp(reg)
            const validFormat = regex.test(newDisplayName)
            if (!validFormat) { return ({ success: false, message: 'new usename has invalid format' }) }
            this.username = newDisplayName
            return {
                success: true,
                message: 'username updates successfully'
            }
        },
        updateEmail(newEmail) {
            const reg = /^[a-zA-Z0-9]+$/
            const regex = new RegExp(reg)
            const validFormat = regex.test(newUsername)
            if (!validFormat) { return ({ success: false, message: 'new usename has invalid format' }) }
            this.username = newUsername
            return {
                success: true,
                message: 'username updates successfully'
            }
        },
        updateProfilePicture(newP) {
            this.profilePicture = newP
            return { success: true, message: 'changed the profile picture' }
        },
        updateUpdatedAt(newD) {
            this.updatedAt = newD
            return { success: true, message: 'successfully updated the updated at date' }
        },
    }
})

module.exports = model('Users', userSchema)