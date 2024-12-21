const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {sendResponse} = require('./functions/sendResponse')
const Users = require('../models/usersModel')


const generateAccessTokenAndRefreshToken = async function (user) {
    try {
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save()
        return {accessToken, refreshToken}
    } catch (e) {
        throw (e)
    }
}

const registerNewUser = async (req, res) => {
    try {
        // CREATION OF THE USER
        // verify the given data if it is usable 
        const {
            password, username, email, displayName
        } = req.body

        // verifying if some field is empty
        if ([displayName, password, email, username].some((field) => field?.trim() === "")) {
            throw ('All fields are required')
        }

        // verifying the username given format
        const reg = new RegExp(/^[a-zA-Z0-9-]+$/)
        const match = reg.test(username)
        if (!match) {
            throw ('Username does not match required format only letters and number can be used')
        }
        // verify if the user already exists using username , email
        const userFound = await Users.findOne({username})
        if (userFound) {
            throw ('User already exists before')
        }
        // if not existed we make it 
        const hashRounds = 10
        const user = await Users.create({
            username, passwordHash: password, displayName: displayName, email: email,
        })

        const createdUser = await Users.findById(user._id).select('-passwordHash')
        if (!createdUser) {
            throw ("user not created")
        }
        res.json({
            success: true, message: 'User created Successfully', data: createdUser
        })
    } catch (e) {
        sendResponse(false, e, 404, undefined, res)
    }

}

const userLogin = async (req, res) => {
    try {
        // gather the data
        const {
            username, password, email, type // todo TO DO LATER
        } = req.body

        // verify if given email and username are valid
        if (!username && !email) {
            throw ("Email or username unvalid")
        }

        // find the user
        const user = await Users.findOne({
            $or: [{username}, {email}]
        })

        if (!user) {
            throw ("user not found")
        }

        // check if the given password is correct for
        const isPasswordValid = user.matchPasswordHash(password)
        if (!isPasswordValid) {
            throw ('Permission Denied, wrong password')
        }
        // generate accessToken and refreshToken
        const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user)

        // retrieve user data except the passwordHash and the refresh token
        const loggedInUser = await Users.findById(user._id).select('-passwordHash -refreshToken')

        // cookie response options
        const options = {
            // adding httpOnly FOR MORE SECURE STORING AND AVOIDING XSS ATTACK
            httpOnly: true,
            // adding secure TO SEND THE COOKIE THROUGH HTTPS ( SECURED HTTP )
            secure: true
        }

        // sending the response
        res.status(202)
            .cookie('access-token', accessToken, options)
            .cookie('refresh-token', refreshToken, options)
            .json({
                success: true, message: 'User Authenticated', data: {
                    accessToken,
                    refreshToken,
                    loggedInUser
                }
            })
    } catch (e) {
        sendResponse(false, e, 404, undefined, res)
    }
}

const userLogout = async (req, res) => {
    try {
        const {
            userId
        } = req.body
        // verify if given userId valid
        if (!userId) {
            throw ('User not found')
        }
        // find the user and remove the accesstoken from the user
        const user = await Users.findByIdAndUpdate(userId, {
                $set: {
                    refreshToken: ''
                }
            }, {
                new: true
            }
        ).select('-passwordHash -refreshToken')

        // remove accesstoken from the cookies
        const options = {
            // protect from XSS attacks
            httpOnly: true,
            // user HTTPS
            secure: true
        }
        res.status(202)
            .clearCookie('access-token', options)
            .clearCookie('refresh-token', options)
            .json({
                success: true, message: 'User Logged out', data: {user}
            })
    } catch
        (e) {
        sendResponse(false, e, 404, undefined, res)
    }
}

const removeUser = async (req, res) => {
    try {
        // Search for the use if found delete it if not found throw error
        const {
            userId,
        } = req.body
        const foundUser = await Users.findById(userId)
        if (!foundUser) {
            throw ('User not found')
        }
        foundUser.archive = true
        res.json({
            success: true, message: 'User removed successfuly'
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
            userId, type, username, email, password, profilePicture, displayName,
        } = req.body
        // verifying if the type of data user wants to change is in the enum
        const typeIsInEnum = typeEnum.includes(type)
        if (!typeIsInEnum) {
            throw (`${type} is invalid item to change`)
        }
        const foundUser = await Users.findById(userId)
        if (!foundUser) {
            throw ('User not found')
        }
        switch (type) {
            case 'email':
                const updatedEmail = foundUser.updateEmail(email)
                if (!updatedEmail.success) {
                    throw (updatedEmail.message)
                }
                console.log(foundUser)
                sendResponse(true, 'email changed successfully', 202, undefined, res)
                break;
            case 'password':
                const updatedPassword = await foundUser.updatePasswordHash(password)
                if (!updatedPassword.success) {
                    throw (updatedPassword.message)
                }
                console.log(foundUser)
                sendResponse(true, 'password changed successfully', 202, undefined, res)
                break;
            case 'username':
                const updatedUsername = foundUser.updateUsername(username)
                if (!updatedUsername.success) {
                    throw (updatedUsername.message)
                }
                console.log(foundUser)
                sendResponse(true, 'Username changed successfully', 202, undefined, res)

                break;
            case 'profile-picture':
                const updatedProfilePicture = foundUser.updateProfilePicture(profilePicture)
                if (!updatedProfilePicture.success) {
                    throw (updatedProfilePicture.message)
                }
                console.log(foundUser)
                sendResponse(true, 'Profile picture changed successfully', 202, undefined, res)

                break;
            case 'display-name':
                const updatedDisplayName = foundUser.updateDisplayName(displayName)
                if (!updatedDisplayName.success) {
                    throw (updatedDisplayName.message)
                }
                console.log(foundUser)
                sendResponse(true, 'display name changed successfully', 202, undefined, res)
                break;
        }
    } catch (e) {
        sendResponse(false, e, 404, undefined, res)
    }
}


const getUserData = async (req, res) => {
    try {
        const {
            userId
        } = req.params
        console.log('userId', userId)
        const foundUser = await Users.findById(userId)
        if (!foundUser) {
            throw ('User not found')
        }
        console.log(foundUser)
        const {
            username, email, displayName
        } = foundUser
        if ((username || email) && displayName) {
            sendResponse(true, 'User data gottent successfully', 202, {username, email, displayName}, res)
        } else {
            throw (`DATA INVALID {  username ${username} email ${email} display name ${displayName}`)
        }
    } catch (e) {
        console.log(e);
        sendResponse(false, e, 404, undefined, res)
    }
}

const removeProfilePicture = async (req, res) => {
    try {
        const {
            userId
        } = req.body
        const foundUser = await Users.findById(userId)
        if (!foundUser) {
            throw ('User not found')
        }
        const removedPP = foundUser.updateProfilePicture(undefined)
        if (!removedPP.success) {
            throw ('profile picture not removed error')
        }
        console.log(foundUser)
        sendResponse(true, 'Profile Picture removed successfully', 202, undefined, res)
    } catch (e) {
        sendResponse(false, e, 404, undefined, res)
    }
}

module.exports = {
    registerNewUser,
    userLogin,
    removeUser,
    updateUserData,
    getUserData,
    removeProfilePicture,
    userLogout,
}