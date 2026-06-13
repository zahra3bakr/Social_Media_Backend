const Conversation = require('../models/conversationModel');
const Message = require('../models/messageModel');
const Notifications = require('../models/notificationModel');

// Sending messages
exports.sendMessage = async (request , response) => {
    try {
        const {message} = request.body
        const receiverId = request.params.id
        const senderId = request.user.id

        if( receiverId === senderId) {
            return response.status(400).json({message: "You can't send message to yourself!"})
        }

        // Create conversation
        let conversation = await Conversation.findOne({participants: {$all: [senderId , receiverId]}})

        // If conversation doesn't exist create new one
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId , receiverId]
            })
        }

        // Create message
        const newMessage = await Message({
            conversationId: conversation._id,
            senderId,
            receiverId,
            message
        })
        // Update last message & update conv with last message
        if(newMessage){
           conversation.lastMessage = newMessage._id
        }

        // Save conversation and message
        await Promise.all([conversation.save(), newMessage.save()]);

        // Socket.io: Send the message in real-time
        const io = request.app.get('io');
        if (io) {
            io.emit('newMessage', newMessage);
        }

        // Create Notification
        await Notifications.create({
            senderId: senderId,
            receiverId: receiverId,
            type: "message"
        })

        return response.status(201).json({
            success: true,
            newMessage
        })


    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!"})
    }
}

// Get messages
exports.getMessages = async (request , response) => {
    try {
        // Get messages
        const userToCHatId = request.params.id
        const sendId = request.user.id

        // Find conversation
        const conversation = await Conversation.findOne({
            participants: { $all: [sendId , userToCHatId] }
        })
        // populate conversation with last message
        .populate("lastMessage")

        if(!conversation) return response.status(200).json([])


        const messages = await Message.find({
            conversationId: conversation._id
        }).sort({createdAt: 1}).populate("senderId" , "username profilePicture").populate("receiverId" , "username profilePicture")
        response.status(200).json(messages)
        
    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!"})
    }
}

// Get all conversations for the current user
exports.getConversations = async (request, response) => {
    try {
        const userId = request.user.id;
        
        // Find all conversations where this user is a participant
        const conversations = await Conversation.find({
            participants: userId
        })
        // populate conversation with last message and participants
        .populate("participants", "username profilePicture")
        .populate("lastMessage");

        response.status(200).json(conversations);

    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!" })
    }
}

// Update Message
exports.updateMessage = async (request, response) => {
    try {
        const { message } = request.body;
        const messageId = request.params.id;
        const userId = request.user.id;

        // Find the message by ID
        const msg = await Message.findById(messageId);
        if (!msg) return response.status(404).json({ message: "Message not found!" });

        // Check if the message belongs to the user
        if (msg.senderId.toString() !== userId) {
            return response.status(403).json({ message: "Unauthorized!" });
        }

        // Update the message
        msg.message = message;
        await msg.save();

        response.status(200).json({
            success: true,
            updatedMessage: msg
        });
    } catch (error) {
        console.log(error);
        response.status(500).json({ message: "Internal Server Error!" });
    }
}

// Delete Message
exports.deleteMessage = async (request, response) => {
    try {
        const messageId = request.params.id;
        const userId = request.user.id;

        // Find the message by ID
        const msg = await Message.findById(messageId);
        if (!msg) return response.status(404).json({ message: "Message not found!" });

        // Check if the message belongs to the user
        if (msg.senderId.toString() !== userId) {
            return response.status(403).json({ message: "Unauthorized!" });
        }

        //  Delete the message
        await Message.findByIdAndDelete(messageId);

        response.status(200).json({
            success: true,
            message: "Message deleted successfully!"
        });
    } catch (error) {
        console.log(error);
        response.status(500).json({ message: "Internal Server Error!" });
    }
}

// Delete entire conversation
exports.deleteConversation = async (request, response) => {
    try {
        const conversationId = request.params.id;
        const userId = request.user.id;

        // Find the conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return response.status(404).json({ message: "Conversation not found!" });

        // Check if the user is a participant
        if (!conversation.participants.includes(userId)) {
            return response.status(403).json({ message: "Unauthorized!" });
        }

        // Delete all messages in this conversation
        await Message.deleteMany({ conversationId });
        // Delete the conversation itself
        await Conversation.findByIdAndDelete(conversationId);

        response.status(200).json({
            success: true,
            message: "Conversation deleted successfully!"
        });
    } catch (error) {
        console.log(error);
        response.status(500).json({ message: "Internal Server Error!" });
    }
}