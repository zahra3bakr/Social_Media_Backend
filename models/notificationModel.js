const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    receiver:{
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: false
    } ,

    sender:{
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: false
    } ,
    
    receiverId :{
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },

    senderId :{
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },

    type: {
        type: String,
        enum: ["like" , "comment" , "message" , "follow", "reply"] ,
        required: true
    } ,

    postId :{
        type: mongoose.Types.ObjectId,
        ref: "Post",
    } ,

    isRead:{
        type: Boolean,
        default: false
    } ,

    content: { type: String }

    
} , {timestamps: true})

module.exports = mongoose.model("Notification" , notificationSchema)