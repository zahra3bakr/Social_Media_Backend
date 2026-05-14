const User = require("../models/userModel")
const Post = require("../models/postModel")
const userValidation = require("../Validations/userValidation")
const Notification = require("../models/notificationModel")

// Get Profile
exports.getProfile = async (request, response) => {
    try {
        const user = await User.findById(request.user.id)
            .select("-password")
            .populate("following", "username email profilePicture")
            .populate("followers", "username email profilePicture")

        if (!user) return response.status(404).json({ message: "User not found!" })

        response.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!" })
    }
}

// Update Profile
exports.updateProfile = async (request, response) => {
    try {
        const { error, value } = userValidation.updateProfileSchema.validate(request.body)

        if (error) {
            return response.status(400).json({ message: error.details[0].message })
        }

        if (request.file) {
            value.profilePicture = `/uploads/users/${request.file.filename}`
        }

        const updatedUser = await User.findByIdAndUpdate(
            request.user.id,
            { $set: value },
            { returnDocument: "after" }
        ).select("-password")

        response.status(200).json({
            success: true,
            user: updatedUser,
            message: "Profile Updated Successfully!"
        })

    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!" })
    }
}

// Delete Profile Picture
exports.deleteProfilePicture = async (request, response) => {
    try {
        const user = await User.findByIdAndUpdate(
            request.user.id,
            { $set: { profilePicture: "" } },
            { returnDocument: "after" }
        ).select("-password")

        response.status(200).json({
            success: true,
            user,
            message: "Profile picture deleted successfully!"
        })
    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!" })
    }
}

exports.toggleFollow = async (request, response) => {
    try {
        const targetUserId = request.params.id
        const currentUserId = request.user.id

        if (targetUserId === currentUserId) {
            return response.status(400).json({ message: "You can't follow yourself!" })

        }

        const targetUser = await User.findById(targetUserId)
        const currentUser = await User.findById(currentUserId)

        const isFollowing = currentUser.following.some(id => id.toString() === targetUserId)

        if (isFollowing) {
            currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId)

            targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId)

            await currentUser.save()
            await targetUser.save()

            // Remove the old follow notification
            await Notification.deleteMany({
                senderId: currentUserId,
                receiverId: targetUserId,
                type: "follow"
            });

            response.status(200).json({
                message: "Unfollowed Successfully!",
                isFollowing: false,
                success: true
            })
        } else {
            currentUser.following.push(targetUserId)
            targetUser.followers.push(currentUserId)

            await currentUser.save()
            await targetUser.save()

            await Notification.create({
                sender: currentUserId,
                receiver: targetUserId,
                senderId: currentUserId,
                receiverId: targetUserId,
                type: "follow",
                content: `${currentUser.username} started following you!`
            })

            response.status(200).json({
                message: "Followed Successfully!",
                isFollowing: true,
                success: true
            })
        }


    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!" })
    }
}

exports.getFollowers = async (request, response) => {
    try {
        const user = await User.findById(request.user.id).populate("followers", "username email profilePicture")

        if (!user) {
            return response.status(404).json({
                message: "User not found!"
            })
        }

        response.status(200).json({
            success: true,
            followers: user.followers
        })
    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!" })
    }
}

exports.getFollowing = async (request, response) => {
    try {
        const user = await User.findById(request.user.id).populate("following", "username email profilePicture")

        if (!user) {
            return response.status(404).json({
                message: "User not found!"
            })
        }

        response.status(200).json({
            success: true,
            following: user.following
        })
    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!" })
    }
}

exports.getNotifications = async (request, response) => {
    try {
        const notifications = await Notification.find({ receiverId: request.user.id })
            .populate("senderId", "username profilePicture email")
            .populate("postId", "content image")
            .sort({ createdAt: -1 })

        response.status(200).json({
            success: true,
            notifications
        })
    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!" })
    }
}

exports.getUserProfile = async (request, response) => {
    try {
        const userId = request.params.id

        const user = await User.findById(userId)
            .select("-password")
            .populate("followers", "username profilePicture")
            .populate("following", "username profilePicture")

        if (!user) {
            return response.status(404).json({
                message: "User not found!",
                success: false
            })
        }

        response.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!" })
    }
}

exports.getSuggestedUsers = async (request, response) => {
    try {
        const currentUserId = request.user.id

        const currentUser = await User.findById(currentUserId).select("following")

        // Exclude self + already followed users
        const excludeIds = [currentUserId, ...(currentUser.following || [])]

        const suggestedUsers = await User.find({
            _id: { $nin: excludeIds }
        })
        .select("username profilePicture bio")
        .limit(5)

        response.status(200).json({
            success: true,
            users: suggestedUsers
        })
    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!" })
    }
}