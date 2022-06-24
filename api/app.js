const express = require("express")
const path = require("path")

const app = express()
const router = require("./src/router")
const pathToIdex = path.resolve(__dirname, "../client/index.html" )
module.exports = app



app.use("/", router);
app.use("/*", (req, res) => {
    res.sendFile(pathToIdex)
})
app.use(express.static(path.resolve(__dirname, "uploads")))
app.listen(3000)



