const express = require("express");
const router = express.Router()
const postController = require("../controllers/postController")
const authMiddleware = require("../middlewares/authMiddleware");
const { isPostOwner } = require("../middlewares/postMiddleware");
const upload = require("../middlewares/uploadMiddleware");


// All posts
router.get("/", postController.getAllPosts)

// Get Single Post
router.get("/:id", postController.getPostById)

// Create Post
router.post("/create", authMiddleware, upload.single("image"), postController.createPost)

// Update Post
router.put("/update/:id", authMiddleware, isPostOwner, upload.single("image"), postController.updatePost)

// Like / Unlike (toggle)
router.patch("/like/:id", authMiddleware, postController.toggleLike)

// Get Post Likes
router.get("/likes/:id", postController.getPostLikes)

// Comments
router.post("/comment/:id", authMiddleware, postController.createComment)

// Get Post comments
router.get("/postcomment/:id", postController.getPostComments)

// Reply
router.post("/comment/:id/reply", authMiddleware, postController.createReply)

// Delete Post
router.delete("/delete/:id", authMiddleware, isPostOwner, postController.deletePost)

// Comment Management
router.put("/comment/:id", authMiddleware, postController.updateComment)
router.delete("/comment/:id", authMiddleware, postController.deleteComment)

module.exports = router