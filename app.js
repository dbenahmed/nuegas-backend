require("dotenv").config()
const express = require('express')
const mongoose = require('mongoose')
const Projects = require('./models/projectsModel')
const Users = require('./models/usersModel')
const app = express()
const port = 2346

mongoose.set('debug', true);
app.use(express.json())

// TESTING ROUTE
app.use('/', (req, res) => {
    const newP = new Projects ({
        name: 'testName   ',
        projectTasks: ['111', '222'],
        members: ['newmember'],
        description: ' test    ',
        createdBy: 'testname'
    })
    console.log('getting')
    newP.changeName('newNaemhere')
    res.send(newP)
})

app.listen(port, async () => {
    try {
        const uri = process.env.MONGODB_URI
        if (!uri) { throw ('uri unvalid') }
        await mongoose.connect(uri)
        console.log('server connected')
    } catch (e) {
        console.log(e)
    }
})