const messageModel = require("../models/messageModel")
const asyncHandler = require('express-async-handler');
const conversationModel = require("../models/conversationModel")
const socket = require('../index');

var FCM = require('fcm-node');

exports.createMessageImage = asyncHandler(async (req, res) => {
  const user1 = req.decoded.user_id;
  const user2 = req.body.receiver_id;
  var conversationId;
  const existingConversation = await conversationModel.findOne({ member: { $all: [user1, user2] } });

  if (existingConversation) {
    const updateConvo = await conversationModel.updateOne({ member: { $all: [user1, user2] } }, { lastMessage: "File" }).exec();

    conversationId = existingConversation._id;
  } else {
    const newConversation = conversationModel({
      member: [user1, user2],
      lastMessage: "File",
    });

    const saveConversation = await newConversation.save();
    conversationId = saveConversation._id;
  }

  const new_message = messageModel({
    conversation_id: conversationId,
    sender_id: req.decoded.user_id,
    receiver_id: req.body.receiver_id,
    image: "http://127.0.0.1:8001/message/" + req.file.filename,
    type: "image"
  });

  const result = await new_message.save();

  // Populate the result with the sender_id field
  const populatedResult = await messageModel.findById(result._id).populate('sender_id');

  // Load the image using sharp

  // Assuming `socket` is a global variable or is properly initialized
  socket.socket.emit(req.body.receiver_id, populatedResult);
  socket.socket.emit("lastMessage", { "id": req.body.receiver_id });

  res.json(populatedResult);
});



exports.createAudioMessage = asyncHandler(async (req, res) => {
  const user1 = req.decoded.user_id
  const user2 = req.body.receiver_id
  var conversationId;
  const existingConversation = await conversationModel.findOne({ member: { $all: [user1, user2] } })

  if (existingConversation) {
    const updateConvo = await conversationModel.updateOne({ member: { $all: [user1, user2] } }, { lastMessage: "File" }).exec()

    conversationId = existingConversation._id
  } else {
    const newConversation = conversationModel({
      member: [user1, user2],
      lastMessage: "File",
    })

    const saveConversation = await newConversation.save()
    conversationId = saveConversation._id

  }


  const new_message = messageModel({
    conversation_id: conversationId,
    sender_id: req.decoded.user_id,
    receiver_id: req.body.receiver_id,
    name: "http://127.0.0.1:8001/audio/" + req.file.filename,
    type: "audio",
    filename: req.file.filename

  })

  const result = await new_message.save()
  // instead of a document.
  const populatedResult = await messageModel.findById(result._id)
    .populate('sender_id') // Replace 'sender_id' with the field you want to populate


  socket.socket.emit(req.body.receiver_id, populatedResult)
  socket.socket.emit("lastMessage", { "id": req.body.receiver_id });


  res.json(populatedResult);











}
)

const admin = require('firebase-admin');
// Initialize Firebase Admin SDK with your service account credentials
admin.initializeApp({
  credential: admin.credential.cert("./ghaza-82ac0-firebase-adminsdk-mhg2h-bdcf44c487.json"),
  // Add your own configuration options as needed
});

exports.createMessage = asyncHandler(async (req, res) => {
  const user1 = req.decoded.user_id;
  const user2 = req.body.receiver_id;
  var conversationId;
  const existingConversation = await conversationModel.findOne({ member: { $all: [user1, user2] } })

  if (existingConversation) {
    const updateConvo = await conversationModel.updateOne({ member: { $all: [user1, user2] } }, { lastMessage: req.body.text }).exec()

    conversationId = existingConversation._id
  } else {
    const newConversation = conversationModel({
      member: [user1, user2],
      lastMessage: req.body.text,
    })

    const saveConversation = await newConversation.save()
    conversationId = saveConversation._id
  }

  const new_message = messageModel({
    conversation_id: conversationId,
    sender_id: req.decoded.user_id,
    receiver_id: req.body.receiver_id,
    text: req.body.text,
    type: "text"
  });

  const result = await new_message.save();

  // Get the FCM token of the receiver from your user model
  const receiverFCMToken = req.body.notificationToken;

  // Send FCM notification
  const payload = {
    notification: {
      title: req.body.userName,
      body: req.body.text,
      // Add any other notification options you want
    },
    data: {
      conversation_id: conversationId.toString(),
      sender_id: req.decoded.user_id.toString(),
      receiver_id: req.body.receiver_id.toString(),
      text: req.body.text,
      type: "text"
    },
  };

  const noti = await admin.messaging().sendToDevice(receiverFCMToken, payload);
  console.log(noti.results[0])

  // Instead of a document.
  const populatedResult = await messageModel.findById(result._id)
    .populate('sender_id'); // Replace 'sender_id' with the field you want to populate


  // Assuming you have a socket object available globally
  // Modify this according to your socket setup
  socket.socket.emit(req.body.receiver_id, populatedResult);
  socket.socket.emit("chat message", populatedResult);
  socket.socket.emit("lastMessage", { "id": req.body.receiver_id });
  res.json(populatedResult);

});

exports.getMessage = asyncHandler(async (req, res) => {
  const conversationId = req.params.conversationId;

  const updatetime = req.query.updatedAT // default to 10 messages per page
  if (updatetime == "") {

    const messages = await messageModel
      .find({
        conversation_id: conversationId,

      })
      .populate('sender_id', null, { receiver_id: { $ne: null } })
      .exec();



    return res.status(200).json(messages);
  }
  const dateObject = new Date(updatetime);


  const messages = await messageModel
    .find({
      conversation_id: conversationId,
      updatedAt: { $gt: dateObject } // Filter messages with updatedAt greater than provided time

    })
    .populate('sender_id', null, { receiver_id: { $ne: null } })
    .exec();



  return res.status(200).json(messages);
});


exports.getLastMessage = asyncHandler(async (req, res) => {

  socket.userSocket.on("lastMessage", asyncHandler(async (convoId) => {
    const messages = await messageModel
      .findOne({ conversation_id: convoId }).sort('-created_at').exec();
  })
  )
})


exports.getMessageIsNotView = asyncHandler(async (req, res) => {
  const conversationId = req.params.conversationId;

  const messages = await messageModel.find({
    conversation_id: conversationId,
    isView: false
  });


  const messageSize = messages.length;

  return res.status(200).json({ messageSize });
})

exports.getLastMessage = asyncHandler(async (req, res) => {

  socket.userSocket.on("lastMessage", asyncHandler(async (convoId) => {
    const messages = await messageModel
      .findOne({ conversation_id: convoId }).sort('-created_at').exec();
  })
  )
})


exports.getAllMessage = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const messages = await messageModel.find({
    user_id: id,
  }).populate('sender_id', null, { receiver_id: { $ne: null } })
    .exec();;




  return res.status(200).json(messages);
})

exports.getLastMessage = asyncHandler(async (req, res) => {

  socket.userSocket.on("lastMessage", asyncHandler(async (convoId) => {
    const messages = await messageModel
      .findOne({ conversation_id: convoId }).sort('-created_at').exec();
  })
  )
})