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
        async updatePasswordHash(newPassword) {
            // check the format of the given password if it is acceptable
            // todo check the format of the password todo
            //const reg = /^(?!.*[\w\s@#$%^&*()-+=_]).+$/
            //const testReg = new RegExp(reg)
            //     const validFormat = testReg.test(newPassword)
            //   if (!validFormat) { return { success: false, message: 'password has unvalid format' } }
            const passwordHash = bcrypt.hashSync(newPassword, 10)
            console.log('pashash', passwordHash)
            this.passwordHash = passwordHash
            return ({
                success: true,
                message: 'password hash updated successfully'
            })
        },
        updateDisplayName(newDisplayName) {
            const reg = /^[a-zA-Z0-9 ]+$/
            const regex = new RegExp(reg)
            const validFormat = regex.test(newDisplayName)
            if (!validFormat) { return ({ success: false, message: 'new usename has invalid format' }) }
            this.displayName = newDisplayName
            return {
                success: true,
                message: 'display name updates successfully'
            }
        },
        updateEmail(newEmail) {
            this.email = newEmail
            return {
                success: true,
                message: 'email updates successfully'
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