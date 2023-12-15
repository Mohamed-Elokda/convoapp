const expressAsyncHandler = require("express-async-handler");
const StoriesModel = require("../models/StoriesModel");
const userModel = require("../models/userModel");
const StoryView = require("../models/StoryViewModel");



exports.createStory = expressAsyncHandler(async (req, res) => {
    const storiesModel = await StoriesModel.create({
        user: req.decoded.user_id,
        image: "http://127.0.0.1:8001/story/" + req.file.filename,
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000) // expire after 1 day

    })
    return res.json(storiesModel)
})


exports.getStory = expressAsyncHandler(async (req, res) => {
    try {
        const results = await userModel.find({
            $or: [
                { "user_phone": { $in: req.body.userPhoneList } },
                { "_id": { $in: req.decoded.user_id } }
            ]
        });

        const userStoriesPromises = results.map(async (user) => {
            const userStories = await StoriesModel.find({ user: user._id }).exec();

            // Sort stories so that the user's own story comes first
            const sortedStories = userStories.sort((a, b) => {
                // Adjust the condition based on your data model
                const aIsMyStory = a.isMyStory || false;
                const bIsMyStory = b.isMyStory || false;

                // If a is the user's own story, it should come first
                return bIsMyStory - aIsMyStory;
            });

            return {
                user: {
                    _id: user._id,
                    user_name: user.user_name,
                    user_image: user.user_image,
                    // Add other user fields as needed
                },
                stories: sortedStories,
            };
        });

        const allUserStories = await Promise.all(userStoriesPromises);

        // Filter out users with no stories
        const filteredUserStories = allUserStories.filter(user => user.stories.length !== 0);


        res.json({ users: filteredUserStories });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});






exports.getMyStory = expressAsyncHandler(async (req, res) => {
    try {

        const userStories = await StoriesModel.find({ user: req.decoded.user_id }).exec();
        res.json(userStories);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

exports.addStoryView = expressAsyncHandler(async (req, res) => {
    try {
        // Check if the user has already viewed the story
        const isView = await StoryView.findOne({ userID: req.decoded.user_id.toString(), storyID: req.params.storyID });

        if (!isView) {
            // If the user has not viewed the story, add a view
            const userStoryView = await StoryView.create({
                userID: req.decoded.user_id.toString(),
                storyID: req.params.storyID
            });

            res.json("View added");
        } else {
            // If the user has already viewed the story, you may choose to handle this case differently.
            // For example, you could return a message indicating that the user has already viewed the story.
            res.json("User has already viewed this story");
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

exports.getStoryViews = expressAsyncHandler(async (req, res) => {
    try {
        // Check if the user has already viewed the story
        const storyViews = await StoryView.find({ storyID: req.params.storyID }).populate("userID").exec();

        const users = storyViews.map((view) => view.userID);


        res.json({ viewsSize: storyViews.length, users: users });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
