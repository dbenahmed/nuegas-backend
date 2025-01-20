// EXPRESS NEEDED PACKAGES
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { Types } = require("mongoose");

// MONGOOSE SCHEMA
const Projects = require("./models/projectsModel");
const Users = require("./models/usersModel");
const Comments = require("./models/commentsModel");
const Tasks = require('./models/tasksModel')


const app = express();
const port = 8000;


// IMPORTING ROUTES
const usersRouter = require('./routes/usersRoute')
const tasksRouter = require('./routes/tasksRoute')
const projectsRouter = require('./routes/projectsRoute')
const testRouter = require('./routes/testRoute')

// IMPORTING MIDDLEWARES
const errorHandler = require("./middleware/errorHandler");

// MONGOOSE DEBUGGING
mongoose.set("debug", true);

// MIDDLEWARES
app.use(express.json());
app.use(cookieParser())

// USING ROUTES
app.use('/users', usersRouter)
app.use('/tasks', tasksRouter)
app.use('/projects', projectsRouter)
// TESTING ROUTE
app.use("/", testRouter);

app.use(errorHandler)

// SERVER LISTENING
app.listen(port, async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw "uri unvalid";
        }
        await mongoose.connect(uri);
        console.log(`server connected http://localhost:${port}/`);
    } catch (e) {
        console.log(e);
    }
});
