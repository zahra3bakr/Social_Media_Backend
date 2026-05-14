const express = require("express");
const router = express.Router()
const searchController = require("../controllers/searchController")
const authMiddleware = require("../middlewares/authMiddleware")

// Search users
router.get("/users" , authMiddleware , searchController.searchUsers)

// Search posts
router.get("/posts" , authMiddleware , searchController.searchPosts)

module.exports = router