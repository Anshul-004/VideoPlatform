import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) //NOT A GOOD PRACTICE, But anyways file will be on our server for a short while., use unique suffix (best prac.)
  }
})

export const upload = multer({ storage })