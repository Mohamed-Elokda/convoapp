const express = require("express")
const dotenv = require("dotenv")
const http = require("http")
const database = require("./database/db_connection")
const conversationRouter = require("./routers/conversationRouter")
const messageRouter = require("./routers/messageRouter")
const userRouter = require("./routers/userRouter")
const ApiError = require("./utils/ApiError")
const { globelError } = require("./middlewares/errorMiddleware")
const SendOtp = require('sendotp');
const { auth } = require("./controllers/userController")
const { createMessage } = require("./controllers/messageController")

const cors = require('cors');
const bodyParser = require('body-parser');
const userModel = require("./models/userModel")
const expressAsyncHandler = require("express-async-handler")
const messageModel = require("./models/messageModel")
const StoriesRouter = require("./routers/StoriesRouter")
const StoriesModel = require("./models/StoriesModel")

const cron = require('node-cron');
const conversationModel = require("./models/conversationModel")



dotenv.config()
const app = express()
const server = http.createServer(app)
app.use(bodyParser.json())
app.use(cors());
database()

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})
const socket = require("socket.io")(server)

app.use("/api/v1/conversation", auth, conversationRouter)
app.use("/api/v1/message", auth, messageRouter)
app.use("/api/v1/", userRouter)
app.use("/api/v1/story", auth, StoriesRouter)

app.use("/profile", express.static('uploads'))
app.use("/story", express.static('uploads/stories'))
app.use("/message", express.static('uploads/messages'))
app.use("/audio", express.static('uploads/messages/voice'))




app.all("*", (req, res, next) => {
    next(new ApiError("Can't find this route:" + req.originalUrl, 404))
})
app.use(globelError)

server.listen(process.env.PORT, () => {
    console.log("server is connected with port " + process.env.PORT)
})

socket.on("connection", (io) => {






    module.exports.Socket_io = io;


})
module.exports.socket = socket;
