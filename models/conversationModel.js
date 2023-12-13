const mongoose = require("mongoose")

const conversationSchema = mongoose.Schema({
    member: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'user',
    }],
    lastMessage: { type: String }
}, { timestamps: true })

const conversationModel = mongoose.model("conversation", conversationSchema)
module.exports = conversationModel