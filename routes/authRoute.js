const express = require("express");
const router = express.Router()
const authController = require("../controllers/authController")

router.post("/register", authController.register)
router.post("/login", authController.login )
router.post("/forgetPassword", authController.forgetPassword)
router.put("/resetPassword/:token", authController.resetPassword)

module.exports = router