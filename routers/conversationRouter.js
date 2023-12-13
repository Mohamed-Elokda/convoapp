const express = require("express")
const { getMyConversation, getUserDataFromConversation, getConversationId } = require("../controllers/conversationController")
const { auth } = require("../controllers/userController")

const router = express.Router()

router.get("/", getMyConversation)
router.get("/:conversationId/:userId", getUserDataFromConversation)
router.get("/:user2", getConversationId)
module.exports = router