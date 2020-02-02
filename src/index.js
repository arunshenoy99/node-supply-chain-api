require('./db/mongoose')
const express = require('express')
const userRouter = require('./routers/users')

const app = express()

app.use(express.json())
app.use(userRouter)

app.get('', async (req, res) => {
    res.send('Hello')
})

const port = process.env.PORT
app.listen(port, () => {
    console.log('Server is up and running on port ' + port)
})