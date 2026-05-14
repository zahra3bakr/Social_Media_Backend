const express = require('express');
const router = express.Router()
const messageController = require("../controllers/messageController")
const authMiddleware = require("../middlewares/authMiddleware")

// Sending message
router.post("/send/:id" , authMiddleware , messageController.sendMessage)

// Get all conversations
router.get("/conversations" , authMiddleware , messageController.getConversations)

// Receiving messages
router.get("/:id" , authMiddleware , messageController.getMessages)

// Update message
router.put("/update/:id" , authMiddleware , messageController.updateMessage)

// Delete message
router.delete("/delete/:id" , authMiddleware , messageController.deleteMessage)

// Delete conversation
router.delete("/conversation/delete/:id" , authMiddleware , messageController.deleteConversation)


module.exports = router