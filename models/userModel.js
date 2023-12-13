const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    user_name: {
        type: String, required: [true, "please provide  username ."]
    },
    user_phone: {
        type: Number, required: [true, "please provide unique phone number ."], unique: true
    },
    user_image: {
        type: String
    },
    password: {
        type: String
    },
    notificationToken: {
        type: String
    }

}, { timestamps: true })

module.exports = mongoose.model("user", userSchema)