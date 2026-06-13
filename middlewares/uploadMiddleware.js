const multer = require("multer"); 
const path = require('path');
const fs = require('fs');

// where & how to save
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folder = req.baseUrl.includes("users") ? "users" : "posts"
        const uploadPath = path.join(__dirname, `../uploads/${folder}/`)
        // recursive -> force 
        fs.mkdirSync(uploadPath, { recursive: true })
        cb(null, uploadPath);
    },

    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
})

// file type
const fileFilter =  (req , file , cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null , true)
    } else{
        cb( new Error("Only images are allowed") , false)
    }
}

const upload = multer({
    storage: storage ,
    fileFilter: fileFilter ,
    limits:{fileSize: 1024 * 1024 * 5} // max 5mb
})

module.exports = upload
