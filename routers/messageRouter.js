const express = require("express")
const { createMessage, getMessage, getMessageIsNotView, createMessageImage, createAudioMessage, getAllMessage } = require("../controllers/messageController")
const { auth } = require("../controllers/userController")

const router = express.Router()
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/messages'); // Define the upload directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Define the filename
    },
});
const storageAudio = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/messages/voice'); // Define the upload directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Define the filename
    },
});

const upload = multer({ storage: storage });
const audioUpload = multer({ storage: storageAudio });


router.post("/", createMessage)
router.post("/image", upload.single('image'), createMessageImage)
router.post("/audio", audioUpload.single('audio'), createAudioMessage)


router.get("/:conversationId", getMessage)
router.get("/all/:id", getAllMessage)

router.get("/:conversationId/false", getMessageIsNotView)

module.exports = router