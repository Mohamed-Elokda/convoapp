const conversationModel = require("../models/conversationModel")
const jwt = require("jsonwebtoken")
const userModel = require("../models/userModel")
const asyncHandler = require('express-async-handler');



exports.getConversationId = asyncHandler(async (req, res) => {
  const user_id = req.decoded.user_id;

  const user2_id = req.params.user2;

  const conversations = await conversationModel
    .findOne({ member: { $all: [user_id, user2_id] } })
    .exec();

  if (conversations) {

    // Return the conversation data in the JSON response
    return res.json(conversations._id);
  } else {
    // Handle the case when no conversations are found for the user
    return res.json("");
  }


});


exports.getMyConversation = asyncHandler(async (req, res) => {
  const user_id = req.decoded.user_id;
  const conversations = await conversationModel
    .find({ member: { $in: [user_id] } })
    .populate('member')
    .exec();

  if (conversations) {
    const conversationData = conversations.map(conversation => {
      return {
        conversationId: conversation._id.toString(), // Get the conversation ID
        user: conversation.member
          .filter(user => user._id.toString() !== user_id) // Filter out the current user
          .map(user => user)[0],
        lastMessage: conversation.lastMessage,
        updatedAt: conversation.updatedAt,
        messageNotViewNum: ""
      };
    });
    conversationData.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    console.log(conversationData)
    // Return the conversation data in the JSON response
    res.json(conversationData);
  } else {
    // Handle the case when no conversations are found for the user
    res.json([]);
  }


});







exports.getUserDataFromConversation = asyncHandler(async (req, res) => {
  const conversationId = req.params.conversationId
  const myUserId = req.params.userId
  conversationModel.findById(conversationId)
    .populate('member')
    .exec((err, conversation) => {
      if (err) {
        // Handle the error
      } else {


        const participants = conversation.member; // Assuming "member" is the array of participants

        // Filter out the current user's ID from the participant list
        const otherParticipants = participants.filter(participant => participant._id.toString() !== myUserId);

        // Construct an array of other participant usernames
        const otherUsernames = otherParticipants.map(participant => ({
          username: participant,
          // Include other participant information you want to include
        }));
        // Return the array of other participant usernames in the JSON response
        res.json({ otherUsernames });


        // Now, the "participants" field will contain user data
        // Access user data for each participant like this:

      }
    });

})

