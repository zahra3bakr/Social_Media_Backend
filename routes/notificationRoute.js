const express = require("express");
const router = express.Router()
const notificationController = require("../controllers/notificationController")
const authMiddleware = require("../middlewares/authMiddleware")

// Get notifications
router.get("/" , authMiddleware , notificationController.getNotification)

// Mark as read
router.patch("/read" , authMiddleware , notificationController.markAsRead)


module.exports = router