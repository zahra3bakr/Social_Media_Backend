const { required } = require('joi');
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Types.ObjectId,
        ref: "Conversation",
        required: true
    },

    senderId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },

    receiverId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },

    message: {
        type: String,
        required: true
    }

})

module.exports = mongoose.model("Message" , messageSchema)