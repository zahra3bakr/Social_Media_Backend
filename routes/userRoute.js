const express = require('express');
const router = express.Router()
const userController = require("../controllers/userController")
const authMiddleware = require("../middlewares/authMiddleware")
const upload = require("../middlewares/uploadMiddleware");

router.get("/profile", authMiddleware, userController.getProfile)

router.put("/profile/update", authMiddleware, (req, res, next) => {
    upload.single("profilePicture")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message })
        }
        next()
    })
}, userController.updateProfile)

router.delete("/profile/picture", authMiddleware, userController.deleteProfilePicture)

router.post("/follow/:id", authMiddleware, userController.toggleFollow)

router.get("/followers", authMiddleware, userController.getFollowers)

router.get("/following", authMiddleware, userController.getFollowing)

router.get("/notifications", authMiddleware, userController.getNotifications)

router.get("/suggestions", authMiddleware, userController.getSuggestedUsers)

router.get("/:id", userController.getUserProfile)


module.exports = router

