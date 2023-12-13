const express = require("express")
const { signup, user, auth, getUserById, getAllUsers, getUser, updateState, login } = require("../controllers/userController")
const multer = require('multer');

const router = express.Router()
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Define the upload directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Define the filename
  },
});

const upload = multer({ storage: storage });


router.post("/signup", upload.single('image'), signup)
router.post("/login", login)
router.get("/me", auth, user)
router.post("/users", auth, getAllUsers)
router.get("/user", auth, getUser)
router.get("/userById/:userId", auth, getUserById)


module.exports = router