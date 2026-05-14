const Post = require("../models/postModel")
const postValidation = require("../Validations/postValidation")
const Like = require("../models/likeModel")
const Comment = require("../models/commentModel")
const User = require("../models/userModel")
const Notification = require("../models/notificationModel")


// Create Post
exports.createPost = async (request, response) => {
    try {
        const { error, value } = postValidation.createPostSchema.validate(request.body)


        if (error) {
            return response.status(400).json({ message: error.details[0].message })
        }

        let imageUrl = ""
        if (request.file) {
            imageUrl = `/uploads/posts/${request.file.filename}`
        }

        // Extract tags from content
        const tags = value.content.match(/#(\w+)/g)?.map(tag => tag.substring(1)) || []

        const newPost = new Post({
            userId: request.user.id,
            content: value.content,
            image: imageUrl,
            tags: tags
        })

        const savedPost = await newPost.save()
        response.status(201).json({
            success: true,
            message: "Post created successfully!",
            post: savedPost
        })
    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!" })
    }
}

// Get All Posts
exports.getAllPosts = async (request, response) => {
    try {
        // Filtering
        const filter = {}

        if (request.query.userId) {
            filter.userId = request.query.userId
        }

        // Pagination
        const page = parseInt(request.query.page) || 1 // current page
        const limit = parseInt(request.query.limit) || 10 // number of posts per page
        const skip = (page - 1) * limit // number of posts to skip

        const posts = await Post.find(filter)
            .populate("userId", "username profilePicture")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const totalPosts = await Post.countDocuments(filter)

        response.status(200).json({
            success: true,
            results: posts.length,
            totalPosts,
            totalpages: Math.ceil(totalPosts / limit),
            currentPage: page,
            posts: posts
        })

    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!" })
    }
}

// Get Single Post By ID
exports.getPostById = async (request, response) => {
    try {
        const post = await Post.findById(request.params.id)
            .populate("userId", "username profilePicture")
            .lean();

        if (!post) {
            return response.status(404).json({ message: "Post not found!" });
        }

        response.status(200).json({
            success: true,
            post
        });
    } catch (error) {
        console.log(error);
        response.status(500).json({ message: "Internal Server Error!" });
    }
}

// Update Post
exports.updatePost = async (request, response) => {
    try {
        const { error, value } = postValidation.updatePostSchema.validate(request.body)

        if (error) {
            return response.status(400).json({ message: error.details[0].message })
        }

        let updateData = { content: value.content };
        if (request.file) {
            updateData.image = `/uploads/posts/${request.file.filename}`;
        } else if (value.image) {
            updateData.image = value.image;
        }

        const updatedPost = await Post.findByIdAndUpdate(request.params.id,
            updateData,
            { new: true }
        ).populate("userId", "username profilePicture");

        if (!updatedPost) {
            return response.status(404).json({ message: "Post not found!" });
        }

        response.status(200).json({
            success: true,
            message: "Post Updated Successfully!",
            post: updatedPost
        })
    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!" })
    }
}

// Delete Post 
exports.deletePost = async (request, response) => {
    try {
        const postId = request.params.id
        const post = await Post.findById(postId)

        if (!post) {
            return response.status(404).json({ message: "Post not found!" })
        }

        if (post.userId.toString() !== request.user.id) {
            return response.status(403).json({ message: "Unauthorized!" })
        }

        await Promise.all([
            Post.findByIdAndDelete(postId),
            Like.deleteMany({ postId: postId }),
            Comment.deleteMany({ postId: postId }),
            Notification.deleteMany({ postId: postId })
        ])

        response.status(200).json({
            message: "Post Deleted Successfully!"
        })

    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!" })
    }
}

// Like / unlike Post
exports.toggleLike = async (request, response) => {
    try {
        const postId = request.params.id
        const userId = request.user.id

        const post = await Post.findById(postId)

        if (!post) {
            return response.status(404).json({ message: "Post not found!" })
        }

        const existingLike = await Like.findOne({ userId, postId })

        if (existingLike) {
            // Unlike
            await Like.deleteOne({ _id: existingLike._id })
            await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } })

            // Delete associated notification
            await Notification.deleteOne({
                senderId: userId,
                receiverId: post.userId,
                type: "like",
                postId: postId
            })

            return response.status(200).json({
                success: true,
                message: "Unliked!"
            })
        } else {
            // Like
            await Like.create({ userId, postId })
            await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } })
            
            // Create Notification
            if (post.userId.toString() !== userId) {
                await Notification.create({
                    senderId: userId,
                    receiverId: post.userId,
                    type: "like",
                    postId: postId
                })
            }

            return response.status(200).json({
                success: true,
                message: "Liked!"
            })
        }

    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!" })
    }
}

// Likes view
exports.getPostLikes = async (request, response) => {
    try {
        const postId = request.params.id;
        const likes = await Like.find({ postId })
            .populate("userId", "username profilePicture")
            .sort({ createdAt: -1 });

        response.status(200).json({
            success: true,
            count: likes.length,
            likes: likes
        });
    } catch (error) {
        console.log(error);
        response.status(500).json({ message: "Internal Server Error!" });
    }
}

// Create Comment 
exports.createComment = async (request, response) => {
    try {
        const { text } = request.body
        const postId = request.params.id
        const userId = request.user.id

        const { error, value } = postValidation.createCommentSchema.validate(request.body)

        if (error) return response.status(400).json({ message: error.details[0].message })

        const userExists = await User.findById(userId)
        if (!userExists) {
            return response.status(404).json({ message: "User not found , Unauthozried to comment!" })
        }

        const post = await Post.findById(postId)
        if (!post) {
            return response.status(404).json({ message: "Post not found!" })
        }

        const newComment = new Comment({
            userId,
            postId,
            text,
            parentComment: null
        })

        const savedComment = await newComment.save()

        await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } })

        // Create Notification
        if (post.userId.toString() !== request.user.id) {
            await Notification.create({
                senderId: request.user.id,
                receiverId: post.userId,
                type: "comment",
                postId: postId
            })
        }

        return response.status(200).json({
            success: true,
            message: "Commented Created Successfully!",
            comment: savedComment
        })

    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!" })
    }
}

// getPost comment
exports.getPostComments = async (request, response) => {
    try {
        const page = parseInt(request.query.page) || 1 // current page
        const limit = parseInt(request.query.limit) || 10 // number of posts per page
        const skip = (page - 1) * limit // number of posts to skip

        const postId = request.params.id
        const comments = await Comment.find({
            postId: postId,
            parentComment: null
        })
            .populate("userId", "username profilePicture")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()

        for (let i = 0; i < comments.length; i++) {
            const replies = await Comment.find({ parentComment: comments[i]._id })
                .populate("userId", "username profilePicture")
                .sort({ createdAt: 1 })
                .lean()

            comments[i].replies = replies;

        }

        response.status(200).json({
            success: true,
            count: comments.length,
            comments: comments // array of replies
        })




    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!" })
    }
}

exports.createReply = async (request, response) => {
    try {
        const { text } = request.body
        const parentCommentId = request.params.id
        const userId = request.user.id

        const { error, value } = postValidation.createCommentSchema.validate(request.body)

        if (error) return response.status(400).json({ message: error.details[0].message })

        const userExists = await User.findById(userId)
        if (!userExists) {
            return response.status(404).json({ message: "User not found , Unauthozried to reply!" })
        }

        const parentComment = await Comment.findById(parentCommentId)

        if (!parentComment) {
            return response.status(404).json({ message: "Parent comment not found!" })
        }

        const newComment = new Comment({
            userId,
            postId: parentComment.postId,
            text,
            parentComment: parentCommentId
        })

        const savedComment = await newComment.save()

        await Post.findByIdAndUpdate(parentComment.postId, { $inc: { commentsCount: 1 } })
        
        // Create Notification for the parent comment owner
        if (parentComment.userId.toString() !== userId) {
            await Notification.create({
                senderId: userId,
                receiverId: parentComment.userId,
                type: "reply",
                postId: parentComment.postId
            })
        }

        response.status(200).json({
            success: true,
            message: "Reply Created Successfully!",
            comment: savedComment
        })

    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!" })
    }
}

// Delete Comment/Reply
exports.deleteComment = async (request, response) => {
    try {
        const commentId = request.params.id
        const userId = request.user.id

        const comment = await Comment.findById(commentId)
        if (!comment) return response.status(404).json({ message: "Comment not found!" })

        // Check ownership
        if (comment.userId.toString() !== userId) {
            return response.status(403).json({ message: "Unauthorized! You can only delete your own comments." })
        }

        if (!comment.parentComment) {
            // This is a main comment - delete it and all its replies
            const repliesCount = await Comment.countDocuments({ parentComment: commentId })
            await Comment.deleteMany({ parentComment: commentId })
            await Comment.findByIdAndDelete(commentId)
            
            // Update post's commentsCount: -1 (main) - repliesCount
            await Post.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -(1 + repliesCount) } })
            
            // Cleanup notifications for this main comment
            await Notification.deleteOne({ senderId: userId, postId: comment.postId, type: "comment" })
        } else {
            // This is a reply
            await Comment.findByIdAndDelete(commentId)
            
            // Update post's commentsCount: -1
            await Post.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } })
            
            // Cleanup notifications for this reply
            await Notification.deleteOne({ senderId: userId, postId: comment.postId, type: "reply" })
        }

        response.status(200).json({ success: true, message: "Deleted successfully!" })
    } catch (error) {
        console.log("Delete Comment Error:", error)
        response.status(500).json({ message: "Internal Server Error!" })
    }
}

// Update Comment/Reply
exports.updateComment = async (request, response) => {
    try {
        const { text } = request.body
        const commentId = request.params.id
        const userId = request.user.id

        if (!text || !text.trim()) {
            return response.status(400).json({ message: "Comment text cannot be empty!" })
        }

        const comment = await Comment.findById(commentId)
        if (!comment) return response.status(404).json({ message: "Comment not found!" })

        // Check ownership
        if (comment.userId.toString() !== userId) {
            return response.status(403).json({ message: "Unauthorized! You can only edit your own comments." })
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { text: text.trim() },
            { new: true }
        ).populate("userId", "username profilePicture")

        response.status(200).json({ 
            success: true, 
            message: "Updated successfully!", 
            comment: updatedComment 
        })
    } catch (error) {
        console.log("Update Comment Error:", error)
        response.status(500).json({ message: "Internal Server Error!" })
    }
}