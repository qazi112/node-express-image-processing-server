const { Router } = require("express")

// Using multer diskstorage()
const multer = require("multer")

const options = {
    destination : "api/uploads/",
    filename: filename
}

const storage = multer.diskStorage(options)

const router = Router()

function filename(request, file, callback){
    callback(null, file.orignalName)
}

const fileFilter = (request, file, callback) => {
    if( file.mimetype === "image/png"){
        request.fileValidationError = "Wromg file type"
        callback(null, false, new Error("Wrong file type"));
    }else{
        callback(null, true);
    }
}

const upload = multer({
    fileFilter: fileFilter,
    storage: storage
})



// Routes
router.post("/upload", upload.single("photo"), (req, res) => {
    if(req.fileValidationError){
        res.status(400).json({error: req.fileValidationError})
    }else{
        res.status(201).json({success: true})
    }
})

module.exports = router