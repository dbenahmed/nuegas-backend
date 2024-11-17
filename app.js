require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Projects = require("./models/projectsModel");

const Users = require("./models/usersModel");
const Comments = require("./models/commentsModel");
const Tasks = require('./models/tasksModel')

const app = express();
const port = 9990;

mongoose.set("debug", true);
app.use(express.json());

// TESTING ROUTE
app.use("/", (req, res) => {
    Tasks.create({
        name: 'test a e',
        dueDate: Date.now(),
        priority: 'high',   
    })
    res.send();
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
