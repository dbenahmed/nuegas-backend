require("dotenv").config()
const express = require('express')
const mongoose = require('mongoose')
const Projects = require('./models/projectsModel')
const Users = require('./models/usersModel')
const app = express()
const port = 2346


app.use(express.json())

// TESTING ROUTE
app.use('/', (req, res) => {
    const newP = Projects.create({
        name: 'test',
        createdBy: 'testuser'
    })
    console.log('getting')
    res.send('done')
})

app.listen(port, async () => {
    try {
        const uri = process.env.MONGODB_URI
        await mongoose.connect(uri)
        console.log('server connected')
    } catch (e) {
        console.log(e)
    }
})