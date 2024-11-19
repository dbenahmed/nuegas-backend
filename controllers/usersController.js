
const { sendResponse } = require('./functions/sendResponse')
const Users = require('../models/usersModel')

const registerNewUser = async (req, res) => {
    try {
        // CREATION OF THE USER
        // verify the given data if it is usable 
        const {
            password,
            username
        } = req.body
        const reg = new RegExp(/^[a-zA-Z0-9-]+$/)
        const match = reg.test(username)
        if (!match) { throw ('Username does not match required format only letters and number can be used') }
        // verify if the user already exists using username , email
        const userFound = await Users.findOne({ username })
        if (userFound) { throw ('User already exists before') }
        // if not existed we make it 
        const hashRounds = 10
        await Users.create({
            username,
            passwordHash: bcrypt.hashSync(password, hashRounds),
            displayName: username,
            email: undefined,
        })
        console.log(foundUser)
        res.json({
            success: true,
            message: 'User created Successfully'
        })
    } catch (e) { sendResponse(false, e, 404, undefined, res) }

}

const userLogin = async (req, res) => {
    try {
        // TODO GET THE USERS HEADER JWT TOKEN AND VERIFY IT BEFORE MAKING A NEW ONE
        // gather the data
        const {
            username,
            password,
            email,
            type // todo TO DO LATER
        } = req.body
        // try to find the user
        // const searchUser = await Users.findOne({ $or: [{ username }, { email }] }, { _id })
        const searchUser = await Users.aggregate([
            {
                $match: { $or: [{ email, username }] }
            }, {
                $limit: 1
            }
        ])
        if (!searchUser.length === 0) { throw ('User Not Found') }
        const foundUser = searchUser[0]
        // check if the given password is correct for 
        const authorize = bcrypt.compareSync(password, foundUser.passwordHash)
        if (!authorize) { throw ('Permission Denied, wrong password') }
        // make the json web token
        const payload = {
            userId: foundUser._id.toString(),
        }
        const generatedJwt = jwt.sign(payload, 'testkey')
        console.log(foundUser)
        res.json({
            success: true,
            message: 'User Authenticated',
            data: {
                jwtoken: generatedJwt
            }
        }).status(202)
    }
    catch (e) {
        sendResponse(false, e, 404, undefined, res)
    }
}

const removeUser = async (req, res) => {
    try {
        // Search for the use if found delete it it not found throw error
        const {
            userId,
        } = req.body
        const foundUser = await Users.findById(userId)
        if (!foundUser) { throw ('User not found') }
        foundUser.archive = true
        console.log(foundUser)
        res.json({
            success: true,
            message: 'User removed successfuly'
        }).status(202)
    } catch (e) {
        console.log(e)
        sendResponse(false, e, 404, undefined, res)
    }
}

const updateUserData = async (req, res) => {
    try {
        // The available possible type of data user would change
        const typeEnum = ['email', 'password', 'username', 'display-name', 'profile-picture']
        // gathering data from the user
        const {
            userId,
            type,
            username,
            email,
            password,
            profilePicture,
            displayName,
        } = req.body
        // verifying if the type of data user wants to change is in the enum
        const typeIsInEnum = typeEnum.includes(type)
        if (!typeIsInEnum) { throw (`${type} is invalid item to change`) }
        const foundUser = await Users.findById(userId)
        if (!foundUser) { throw ('User not found') }
        switch (type) {
            case 'email':
                const updatedEmail = foundUser.updateEmail(email)
                if (!updatedEmail.success) { throw (updatedEmail.message) }
                console.log(foundUser)
                sendResponse(true, 'email changed successfully', 202, undefined, res)
                break;
            case 'password':
                const updatedPassword = await foundUser.updatePasswordHash(password)
                if (!updatedPassword.success) { throw (updatedPassword.message) }
                console.log(foundUser)
                sendResponse(true, 'password changed successfully', 202, undefined, res)
                break;
            case 'username':
                const updatedUsername = foundUser.updateUsername(username)
                if (!updatedUsername.success) { throw (updatedUsername.message) }
                console.log(foundUser)
                sendResponse(true, 'Username changed successfully', 202, undefined, res)

                break;
            case 'profile-picture':
                const updatedProfilePicture = foundUser.updateProfilePicture(profilePicture)
                if (!updatedProfilePicture.success) { throw (updatedProfilePicture.message) }
                console.log(foundUser)
                sendResponse(true, 'Profile picture changed successfully', 202, undefined, res)

                break;
            case 'display-name':
                const updatedDisplayName = foundUser.updateDisplayName(displayName)
                if (!updatedDisplayName.success) { throw (updatedDisplayName.message) }
                console.log(foundUser)
                sendResponse(true, 'display name changed successfully', 202, undefined, res)
                break;
        }
    } catch (e) { sendResponse(false, e, 404, undefined, res) }
}


const getUserData = async (req, res) => {
    try {
        const {
            userId
        } = req.params
        console.log('userId', userId)
        const foundUser = await Users.findById(userId)
        if (!foundUser) { throw ('User not found') }
        console.log(foundUser)
        const {
            username,
            email,
            displayName
        } = foundUser
        if ((username || email) && displayName) { sendResponse(true, 'User data gottent successfully', 202, { username, email, displayName }, res) }
        else { throw (`DATA INVALID {  username ${username} email ${email} display name ${displayName}`) }
    } catch (e) { console.log(e); sendResponse(false, e, 404, undefined, res) }
}

const removeProfilePicture = async (req, res) => {
    try {
        const {
            userId
        } = req.body
        const foundUser = await Users.findById(userId)
        if (!foundUser) { throw ('User not found') }
        const removedPP = foundUser.updateProfilePicture(undefined)
        if (!removedPP.success) { throw ('profile picture not removed error') }
        console.log(foundUser)
        sendResponse(true, 'Profile Picture removed successfully', 202, undefined, res)
    } catch (e) { sendResponse(false, e, 404, undefined, res) }
}

module.exports = {
    registerNewUser,
    userLogin,
    removeUser,
    updateUserData,
    getUserData,
    removeProfilePicture,
}