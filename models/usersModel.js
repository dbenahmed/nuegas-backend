const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {Schema, model} = require('mongoose')

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
        match: [/^[a-zA-Z0-9 ]+$/, 'please only use letters and numbers and -']
    },
    email: {type: String, trim: true, lowerCase: true, unique: true},
    profilePicture: {type: String, default: ''},
    createdAt: {type: Date, default: Date.now(), immutable: true},
    updatedAt: {type: Date, default: Date.now()},
    refreshToken: {type: String, default: ''},
}, {
    methods: {
        updateUsername(newUsername) {
            const reg = /^[a-zA-Z0-9]+$/
            const regex = new RegExp(reg)
            const validFormat = regex.test(newUsername)
            if (!validFormat) {
                return ({success: false, message: 'new username has invalid format'})
            }
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
            //   if (!validFormat) { return { success: false, message: 'password has invalid format' } }
            /*const passwordHash = bcrypt.hashSync(newPassword, 10)
            console.log('pashash', passwordHash)
            this.passwordHash = passwordHash*/
            this.passwordHash = newPassword
            return ({
                success: true,
                message: 'password hash updated successfully'
            })
        },
        updateDisplayName(newDisplayName) {
            const reg = /^[a-zA-Z0-9 ]+$/
            const regex = new RegExp(reg)
            const validFormat = regex.test(newDisplayName)
            if (!validFormat) {
                return ({success: false, message: 'new username has invalid format'})
            }
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
            return {success: true, message: 'changed the profile picture'}
        },
        updateUpdatedAt(newD) {
            this.updatedAt = newD
            return {success: true, message: 'successfully updated the updated at date'}
        },
    }
})

// verify if password changed before saving the user
// if password changed, make a hashed password and save it
// else let the previously hashed password
userSchema.pre("save", async function (next) {
    if (!this.isModified('passwordHash')) {
        return next()
    }
    this.passwordHash = bcrypt.hash(this.passwordHash, 10)
    next()
})

// compare users hashed password with give unhashed password
userSchema.methods.matchPasswordHash = async function (password) {
    return await bcrypt.compare(password, this.passwordHash)
}

// generate access token for jwt authentication
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        displayName: this.displayName,
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id
    }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}
module.exports = model('Users', userSchema)