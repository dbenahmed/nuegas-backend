// EXPRESS NEEDED PACKAGES
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

// MONGOOSE SCHEMA
const Projects = require("./models/projectsModel");
const Users = require("./models/usersModel");
const Comments = require("./models/commentsModel");
const Tasks = require('./models/tasksModel')

// ROUTES
const usersRouter = require('./routes/usersRoute')
const tasksRouter = require('./routes/tasksRoute')


const app = express();
const port = 9990;



mongoose.set("debug", true);
app.use(express.json());


app.use('/users', usersRouter)
app.use('/tasks', tasksRouter)
// TESTING ROUTE
app.use("/", async (req, res) => {

    res.send('done')
});

app.listen(port, async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw "uri unvalid";
        }
        await mongoose.connect(uri);
        console.log("server connected");
    } catch (e) {
        console.log(e);
    }
});
