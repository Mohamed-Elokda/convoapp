const mongoose = require("mongoose")


const storyShema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    image: { type: String },
    createdAt: { type: Date, default: Date.now },

    expiresAt: { type: Date, expires: '1h', default: Date.now } // expire after 1 day

}, { timestamps: true })



module.exports = mongoose.model("story", storyShema)