const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {sendResponse} = require('./functions/sendResponse')
const Users = require('../models/usersModel')
const ApiResponse = require("../utils/ApiResponse");
ApiError = require('../utils/ApiError')

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
            throw new ApiError(400, 'All fields are required', {password, username, email, displayName})
        }

        // verifying the username given format
        const reg = new RegExp(/^[a-zA-Z0-9-]+$/)
        const match = reg.test(username)
        if (!match) {
            throw new ApiError(400, 'Username does not match required format only letters and number can be used', {username})
        }
        // verify if the user already exists using username , email
        const userFound = await Users.findOne({username})
        if (userFound) {
            throw new ApiError(400, 'User already exists')
        }
        // if not existed we make it 
        const user = await Users.create({
            username, passwordHash: password, displayName: displayName, email: email,
        })

        const createdUser = await Users.findById(user._id).select('-passwordHash')
        if (!createdUser) {
            throw new ApiError(500, 'User not created', {createdUser})
        }
        const apiResponse = new ApiResponse(202, 'User created successfully', {createdUser}, true)
        res.json(apiResponse).status(apiResponse.successCode)
    } catch (e) {
        res.json(e).status(e.statusCode)
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
            throw new ApiError(400, 'Email or username unvalid', {username, email})
        }

        // find the user
        const user = await Users.findOne({
            $or: [{username}, {email}]
        })

        if (!user) {
            throw new ApiError(404, 'User not found', {user})
        }

        // check if the given password is correct for
        const isPasswordValid = user.matchPasswordHash(password)
        if (!isPasswordValid) {
            throw new ApiError(401, 'Permission Denied, wrong password')
        }
        // generate accessToken and refreshToken
        const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user)

        // retrieve user data except the passwordHash and the refresh token
        const loggedInUser = await Users.findById(user._id).select('-passwordHash -refreshToken')

        // cookie response options
        const options = {
            // adding httpOnly FOR MORE SECURE STORING AND AVOIDING XSS ATTACK
            httpOnly: true, // adding secure TO SEND THE COOKIE THROUGH HTTPS ( SECURED HTTP )
            secure: true
        }

        // sending the response

        const apiResponse = new ApiResponse(202, 'User Authenticated', {
            accessToken, refreshToken, loggedInUser
        }, true)
        res.status(202)
            .cookie('access-token', accessToken, options)
            .cookie('refresh-token', refreshToken, options)
            .json(apiResponse)
    } catch (e) {
        res.status(e.statusCode).json(e)
    }
}

const userLogout = async (req, res) => {
    try {
        const {
            userId
        } = req.body
        // verify if given userId valid
        if (!userId) {
            throw new ApiError(404, 'User not found')
        }
        // find the user and remove the accesstoken from the user
        const user = await Users.findByIdAndUpdate(userId, {
            $set: {
                refreshToken: ''
            }
        }, {
            new: true
        }).select('-passwordHash -refreshToken')

        // remove accesstoken from the cookies
        const options = {
            // protect from XSS attacks
            httpOnly: true, // user HTTPS
            secure: true
        }
        const apiResponse = new ApiResponse(202, 'User Logged out', {user}, true)
        res.status(202)
            .clearCookie('access-token', options)
            .clearCookie('refresh-token', options)
            .json(apiResponse)
    } catch (e) {
        res.status(e.statusCode).json(e)
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
            throw new ApiError(404, 'User not found')
        }
        foundUser.archive = true
        const apiResponse = new ApiResponse(202, 'User removed successfully', {})
        res.json(apiResponse).status(202)
    } catch (e) {
        res.status(e.statusCode).json(e)
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
            throw new ApiError(400, 'Type is invalid', {type})
        }
        const foundUser = await Users.findById(userId)
        if (!foundUser) {
            throw new ApiError(404, 'User not found')
        }
        switch (type) {
            case 'email':
                const updatedEmail = foundUser.updateEmail(email)
                if (!updatedEmail.success) {
                    throw new ApiError(500, updatedEmail?.message || 'Error updating email')
                }
                const apiResponse = new ApiResponse(202, 'Email updated successfully', {updatedEmail})
                res.status(200).json(apiResponse)
                break;
            case 'password':
                const updatedPassword = await foundUser.updatePasswordHash(password);
                if (!updatedPassword.success) {
                    throw new ApiError(500, updatedPassword?.message || 'Error updating password');
                }
                const passwordResponse = new ApiResponse(202, 'Password changed successfully', {updatedPassword});
                res.status(200).json(passwordResponse);
                break;
            case 'username':
                const updatedUsername = foundUser.updateUsername(username);
                if (!updatedUsername.success) {
                    throw new ApiError(500, updatedUsername?.message || 'Error updating username');
                }
                const usernameResponse = new ApiResponse(202, 'Username updated successfully', {updatedUsername});
                res.status(200).json(usernameResponse);
                break;
            case 'profile-picture':
                const updatedProfilePicture = foundUser.updateProfilePicture(profilePicture);
                if (!updatedProfilePicture.success) {
                    throw new ApiError(500, updatedProfilePicture?.message || 'Error updating profile picture');
                }
                const profilePictureResponse = new ApiResponse(202, 'Profile picture updated successfully', {updatedProfilePicture});
                res.status(200).json(profilePictureResponse);
                break;
            case 'display-name':
                const updatedDisplayName = foundUser.updateDisplayName(displayName);
                if (!updatedDisplayName.success) {
                    throw new ApiError(500, updatedDisplayName?.message || 'Error updating display name');
                }
                const displayNameResponse = new ApiResponse(202, 'Display name updated successfully', {updatedDisplayName});
                res.status(200).json(displayNameResponse);
                break;
        }
    } catch (e) {
        res.status(e.statusCode).json(e)
    }
}


const getUserData = async (req, res) => {
    try {
        const {
            userId
        } = req.params
        const foundUser = await Users.findById(userId)
        if (!foundUser) {
            throw new ApiError(404, 'User not found')
        }
        console.log(foundUser)
        const {
            username, email, displayName
        } = foundUser
        if ((username || email) && displayName) {
            const apiResponse = new ApiResponse(202, 'User data gottent successfully', {username, email, displayName})
            res.status(200).json(apiResponse)
        } else {
            throw new ApiError(404, 'Invalid Data', {username, email, displayName})
        }
    } catch (e) {
        res.status(e.statusCode).json(e)
    }
}

const removeProfilePicture = async (req, res) => {
    try {
        const {
            userId
        } = req.body
        const foundUser = await Users.findById(userId)
        if (!foundUser) {
            throw new ApiError(404, 'User not found')
        }
        const removedPP = foundUser.updateProfilePicture(undefined)
        if (!removedPP.success) {
            throw new ApiError(500, 'Error profile picture was not removed ', {removedPP})
        }
        const apiResponse = new ApiResponse(202, 'Profile picture removed successfully')
        res.status(200).json(apiResponse)
    } catch (e) {
        res.status(e.statusCode).json(e)
    }
}

module.exports = {
    registerNewUser, userLogin, removeUser, updateUserData, getUserData, removeProfilePicture, userLogout,
}