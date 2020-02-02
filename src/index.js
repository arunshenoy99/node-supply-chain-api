require('./db/mongoose')
const express = require('express')

const app = express()

app.use(express.json())

const port = process.env.PORT
app.listen(port, () => {
    console.log('Server is up and running on port ' + port)
})