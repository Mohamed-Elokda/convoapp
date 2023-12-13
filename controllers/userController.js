const userModel = require("../models/userModel")
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const socket = require('../index');
const bcrypt = require('bcrypt');
const conversationModel = require("../models/conversationModel");


exports.login = asyncHandler(async (req, res) => {
  const userExist = await userModel.findOne({ user_phone: req.body.phone }).exec()


  if (userExist) {
    const passwordMatch = await bcrypt.compare(req.body.password, userExist.password);
    if (passwordMatch) {


      var token = jwt.sign({ user_id: userExist._id }, process.env.JWT_SECRET_KEY);

      return res.status(200).json({
        "token": token, "data": {
          "_id": userExist._id,
          "user_name": userExist.user_name,
          "user_phone": userExist.user_phone,
          "user_image": userExist.user_image,
          "__v": userExist.__v,
          "createdAt": userExist.createdAt,
          "updatedAt": userExist.updatedAt,

        }
      })


    }
  }



  return res.status(404).send("user not found!")




})









exports.signup = asyncHandler(async (req, res) => {
  // Set up multer for file uploads
  const users = await userModel.findOne({ user_phone: req.body.phone }).exec()

  if (users) {

    return res.status(501).send("the phone number is exists!")


  }
  else {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    const user = await userModel.create({
      user_name: req.body.name,
      user_phone: req.body.phone,
      user_image: "http://127.0.0.1:8001/profile/" + req.file.filename,
      password: hashedPassword,
      notificationToken: req.body.notificationToken

    })
    console.log(req.body.notificationToken)

    var token = jwt.sign({ user_id: user._id }, process.env.JWT_SECRET_KEY);



    return res.status(200).json({
      "token": token, "data": {
        "id": user._id,
        "name": user.user_name,
        "phone": user.user_phone,
        "image": user.user_image,
        "state": user.state
      }
    })

  }


})




exports.user = asyncHandler(async (req, res) => {
  try {
    const user = await userModel.findById(req.decoded.user_id).exec();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return the user data
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: 'Error fetching user data' });
  }
});



exports.getAllUsers = asyncHandler(async (req, res) => {
  const resultUsers = await userModel.find({ "user_phone": { $in: req.body.userPhoneList } }).exec()

  const requests = await Promise.all(resultUsers.map(async (user) => {
    const conversations = await conversationModel
      .findOne({ member: { $all: [req.decoded.user_id, user._id] } })
      .exec();

    return {
      _id: user._id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      user_image: user.user_image,
      user_name: user.user_name,
      user_phone: user.user_phone,
      conversationId: conversations ? conversations._id : null,
      notificationToken: user.notificationToken
    };
  }));

  const filteredRequests = requests.filter(result => result._id.toString() !== req.decoded.user_id);

  console.log(filteredRequests);
  return res.status(200).json(filteredRequests);
});

exports.getUser = asyncHandler(async (req, res) => {

  const result = await userModel.find({ "user_phone": { $in: req.params.user_phone } })
  return res.status(200).json(result)



})
exports.getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.userId

  const result = await userModel.findById(userId)
  return res.status(200).json(result)


})
exports.auth = function verifyToken(req, res, next) {
  // Get the token from the request header, query parameters, or cookies
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Failed to authenticate token' });
    }

    // Attach the decoded payload to the request object for use in subsequent middleware or routes
    req.decoded = decoded;

    // Continue to the next middleware or route
    next();
  });
}
