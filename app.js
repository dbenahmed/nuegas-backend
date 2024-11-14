const express = require('express')
const mongoose = require('mongoose')
const app = express()
const port = 2346

app.use(express.json())


app.use('/')


// TESTING ROUTE
app.get('/', (req, res) => {
    console.log('getting')
    res.send('done')
})

app.listen(port, async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('server connected')
    } catch (e) {
        console.log(e)
    }
})