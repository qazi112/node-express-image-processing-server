const { Router } = require("express")
const multer = require("multer")
const path = require("path")
const router = Router()

const photoPath = path.resolve(__dirname, "../../client/photo-viewer.html")


function filename(request, file, callback){
    callback(null, file.originalname)
}

const options = {
    destination : "api/uploads/",
    filename: filename
}

const storage = multer.diskStorage(options)

const fileFilter = (request, file, callback) => {
    if( file.mimetype !== "image/png"){
        request.fileValidationError = "Wrong file type"
        callback(null, false, new Error("Wrong file type"));
    }else{
        callback(null, true);
    }
}

const upload = multer({
    fileFilter,
    storage,
  });

  
router.route("/upload")
  .post(upload.single('photo'), (req, res) => {
    if(req.fileValidationError){
        return res.status(400).json({error: req.fileValidationError})
    }
    return res.status(201).json({success: true})
  })

router.route("/photo-viewer")
  .get((req, res) => {
      res.sendFile(photoPath)
  })
module.exports = router