// Import mongoose
const mongoose = require('mongoose');

// Define the StoryView schema
const storyViewSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,

    },
    storyID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'story',
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

// Create the StoryView model
const StoryView = mongoose.model('StoryView', storyViewSchema);

// Export the model
module.exports = StoryView;
