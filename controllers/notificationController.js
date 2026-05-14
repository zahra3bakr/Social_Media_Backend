const Notification = require('../models/notificationModel');

exports.getNotification = async (request , response ) => {
    try {
        const notifications = await Notification.find({ receiverId: request.user.id })
            .populate("senderId", "username profilePicture email")
            .populate("postId", "content image")
            .sort({ createdAt: -1 })

        response.status(200).json({ success: true, notifications })
    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!"})
    }
}

exports.markAsRead = async (request , response) => {
    try {
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