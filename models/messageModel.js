const mongoose = require("mongoose")

const messageModel = mongoose.Schema({
    conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'conversation' },
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    text: { type: String },
    image: { type: String },
    name: String,
    type: String,
    filename: String,
    isView: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model("message", messageModel)