const messageModel = require("../models/messageModel")
const asyncHandler = require('express-async-handler');
const conversationModel = require("../models/conversationModel")
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const socket = require('../index');
const jwt = require('jsonwebtoken');
const sharp = require("sharp");
const path = require('path'); // Import the path module

var FCM = require('fcm-node');

var serverKey = 'AAAA80ajG-I:APA91bF_jPzxZmgcUEUDpwjM_bD0S0KcS2jqdWEFGHJ6yNTlm5HgDyjG6K-a43rWR0PCfOKuNkXM5jDPHwrlMFXXTzZdDOKjjTK6W0c-Ci60ub-kfdqDz-tVrqSUuDeoK6yWWXXnnb3-'; //put your server key here
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


exports.createMessage = asyncHandler(async (req, res) => {
  const user1 = req.decoded.user_id
  const user2 = req.body.receiver_id
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
  const result = await new_message.save()
  // instead of a document.
  const populatedResult = await messageModel.findById(result._id)
    .populate('sender_id') // Replace 'sender_id' with the field you want to populate



  res.json(populatedResult);

  socket.socket.emit(req.body.receiver_id, populatedResult)
  socket.socket.emit("chat message", populatedResult)

  socket.socket.emit("lastMessage", { "id": req.body.receiver_id });


})
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

    console.log(messages)


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

  console.log(messages)


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


  console.log(id)
  console.log({ messages })

  return res.status(200).json(messages);
})

exports.getLastMessage = asyncHandler(async (req, res) => {

  socket.userSocket.on("lastMessage", asyncHandler(async (convoId) => {
    const messages = await messageModel
      .findOne({ conversation_id: convoId }).sort('-created_at').exec();
  })
  )
})