const express = require("express");
const router = express.Router()
const authController = require("../controllers/authController")

router.post("/register", authController.register)
router.post("/login", authController.login )
router.post("/forgetPassword", authController.forgetPassword)
router.put("/resetPassword/:token", authController.resetPassword) // :token -> this what useParams() gets

module.exports = router