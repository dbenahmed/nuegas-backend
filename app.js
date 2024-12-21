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
const projectsRouter = require('./routes/projectsRoute')

const app = express();
const port = 9990;



mongoose.set("debug", true);
app.use(express.json());


app.use('/users', usersRouter)
app.use('/tasks', tasksRouter)
app.use('/projects', projectsRouter)
// TESTING ROUTE
app.use("/", async (req, res) => {
    /* Projects.create({
        name: 'testPRoject22',
        projectTasks: [],
        members: [],
        createdBy: '673b7c955df7e17c17660bd4',
    }) */
    /* Tasks.create({
        name: 'test',
        dueDate: new Date(2024, 11, 24),
        createdBy: new mongoose.Types.ObjectId(),
        assignees: [],
    }) */
    /* Tasks.create({
        name: 'testTask222',
        dueDate: Date.now(),
        priority: 'urgent',
        status: 'doing',
        assignees: ['673b7c955df7e17c17660bd4']
    }) */
    const t = Tasks.findById('6740e2b3778db208b85f567e')
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
