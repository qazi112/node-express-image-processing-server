const express = require("express")
const path = require("path")

const app = express()

const pathToIdex = path.resolve(__dirname, "../client/index.html" )
module.exports = app

const router = require("./src/router")

app.use(express.static(path.resolve(__dirname, "uploads")))
app.use("/", router);
app.use("/*", (req, res) => {
    res.sendFile(pathToIdex)
})

app.listen(3000)



