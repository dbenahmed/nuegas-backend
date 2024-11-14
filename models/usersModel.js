const { Schema, model } = require('mongoose')

const userSchema = new Schema({
    username: { type: String },
    displayName: { type: String },
    password: { type: String },
    profilePicture: { type: String },
    email: { type: String },
    createdAt: { type: Date, default: Date.now(), immutable: true },
    updatedAt: { type: Date, default: Date.now() }
})

module.exports = model('Users', userSchema)