const express = require("express");
const { createStory, getStory, getMyStory, addStoryView, getStoryViews } = require("../controllers/StoriesController");

const router = express.Router()
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/stories'); // Define the upload directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Define the filename
    },
});

const upload = multer({ storage: storage });
router.post("/create", upload.single('image'), createStory)
router.post("/get", getStory)
router.get("/myStories", getMyStory)
router.get("/addStoryView/:storyID", addStoryView)
router.get("/getStoryView/:storyID", getStoryViews)






module.exports = router