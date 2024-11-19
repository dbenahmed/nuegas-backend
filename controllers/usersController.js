
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
        res.json({
            success: true,
            message: 'User created Successfully'
        })
    } catch (e) { res.status(404).json({ success: false, message: e }) }

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
        res.json({
            success: true,
            message: 'User Authenticated',
            data: {
                jwtoken: generatedJwt
            }
        }).status(202)
    }
    catch (e) {
        res.status(404).json({
            success: false,
            message: e.message
        })
    }
}

const removeUser = async (req, res) => {
    try {
        // Search for the use if found delete it it not found throw error
        const {
            userId,
        } = req.body
        const foundUser = Users.findById(userId)
        if (!foundUser) { throw ('User not found') }
        foundUser.archive = true
        res.json({
            success: true,
            message: 'User removed successfuly'
        }).status(202)
    } catch (e) {
        console.log(e)
        res.json({
            success: false,
            response: e
        }).status(404)
    }
}

const updateUserData = async (req, res) => {
    // The available possible type of data user would change
    const typeEnum = ['email', 'password', 'username', 'display-name', 'profile-picture']
    // gathering data from the user
    const {
        userId,
        type,
        newUsername,
        newEmail,
        newPassword,
        profilePicture,
        displayName,
    } = req.body
    // verifying if the type of data user wants to change is in the enum
    const typeIsInEnum = typeEnum.includes(type)
    if (!typeIsInEnum) { throw (`${type} is invalid item to change`) }
    const foundUser =  Users.findById(userId)
    if (!foundUser) {throw('User not found')}
    switch (type) {
        case 'email':
             foundUser.
            break;
        case 'password':
            break;
        case 'username':
            break;
        case 'profile-picture':
            break;
        case 'display-name':
            break;
    }
}


const getUserData = async (req, res) => {

}

const removeProfilePicture = async () => {

}

module.exports = {
    registerNewUser,
    userLogin,
    removeUser,
    updateUserData,
    getUserData,
    removeProfilePicture,
}