const Notification = require('../models/notificationModel');

// Get notifications
exports.getNotification = async (request , response ) => {
    try {
        // Get notifications
        const notifications = await Notification.find({ receiverId: request.user.id })
            // populate notifications with sender and post
            .populate("senderId", "username profilePicture email")
            .populate("postId", "content image")
            .sort({ createdAt: -1 })

        response.status(200).json({ success: true, notifications })
    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!"})
    }
}

// Mark notifications as read
exports.markAsRead = async (request , response) => {
    try {
        // Mark notifications as read
        await Notification.updateMany(
            {receiverId: request.user.id , isRead: false} , 
            {$set: {isRead: true}}
        )

        response.status(200).json({success: true , message: "Notifications marked as read!"})
    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!"})
    }
}