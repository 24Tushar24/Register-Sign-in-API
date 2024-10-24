const express = require('express')
const app = express()
const port = 3000
const mongoose = require('mongoose')
const cors = require('cors')
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())


app.get('/', (req, res) => {
    res.send("Hello")
})

mongoose.connect('mongodb://localhost:27017/mongos').then((res) => {
    console.log("database is connected")
}).catch((error) => {
    console.log(error)

})

app.use("/api", require("./Router/route"))

app.listen(port, () => {
    console.log(`server is running on htttp://localhost:${port}`)
})