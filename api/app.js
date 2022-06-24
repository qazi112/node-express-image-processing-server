const express = require("express")
const path = require("path")

const app = express()

const pathToIdex = path.resolve(__dirname, "../client/index.html" )
module.exports = app

app.use("/*", (req, res) => {
    res.sendFile(pathToIdex)
})



