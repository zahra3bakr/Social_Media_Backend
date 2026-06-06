// Req validator
const authValidation = require("../Validations/authValidation")

// Req models
const User = require("../models/userModel")

// Req utils
const bcrypt = require("bcrypt")
const crypto = require("crypto")

// Req services
const tokenService = require("../utils/tokenService")

// Config
require("dotenv").config()

exports.register = async (request , response) => {
    try {
        const { error, value } = authValidation.registerSchema.validate(request.body);

        if (error) {
            return response.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const { email, password } = value;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return response.status(400).json({
                message: 'Email already exists!'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            ...value,
            password: hashedPassword ,
        });
        await newUser.save();

        const token = tokenService.generateToken(newUser._id);

        response.status(201).json({
            message: 'User & Profile registered successfully!',
            token ,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                profile : {
                    bio: newUser.bio || "" ,
                    profilePicture: newUser.profilePicture || "" ,
                    createdAt: newUser.createdAt
                }
            },
        });
    } catch (error) {
        console.log(error)
        response.status(500).json({

            message: "Internal Server Error!" ,

        });
    }
}

exports.login = async (req, res) => {
    try {
      // Validation
        const { error, value } = authValidation.loginSchema.validate(
        req.body,
        {
        abortEarly: false,
        },
        );

        if (error) {
            return res.status(400).json({
                message: error.details.map(err => err.message),
            });
        }


        const { email, password } = value;

        // Find user
        const user = await User.findOne({ email });
        if (!user)
        return res.status(400).json({ message: "Invalid credentials" });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });

        // Generate token
        const token = tokenService.generateToken(user._id);

        // Find user with following populated
        const userWithFollowing = await User.findById(user._id).select('-password');

        res.status(200).json({
        success: true,
        token,
        user: {
            _id: user._id,
            id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture || "",
            bio: user.bio || "",
            following: userWithFollowing.following || [],
            followers: userWithFollowing.followers || [],
        },
        });

  } catch (err) {
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

// Forget Password
exports.forgetPassword = async (request , response) => {
    try {
        const user = await User.findOne({ email: request.body.email });

        if (!user) {
            return response.status(400).json({ message: "User not found!" });
        }
        const resetToken = crypto.randomBytes(20).toString("hex");

        user.resetPasswordToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        await user.save();

        const sendEmail = require("../utils/emailSender");
        const resetUrl = `${process.env.ALLOWED_ORIGIN || 'http://localhost:5173'}/reset-password/${resetToken}`;
        const message = `Forget Password? \n\nClick the link below to reset your password: \n\n ${resetUrl}`;

        await sendEmail({
            email: user.email,
            subject: "Password Reset Request",
            message: message,
        });
        
        console.log("-----------------------------------------");
        console.log("Email sent successfully!");
        console.log("-----------------------------------------");

        response.status(200).json({ 
            message: "Password reset email sent!",
            success: true
        });
    } catch (error) {
        console.log(error)

        const user = await User.findOne({ email: request.body.email });
        if (user) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
        }
        response.status(500).json({ message: "Internal Server Error!" })
    }
}

// Reset Password
exports.resetPassword = async (request , response ) => {
    try {
        const hashedToken = crypto
            .createHash("sha256")
            .update(request.params.token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return response.status(400).json({ message: "Token is invalid or has been expired!" });
        }

        user.password = await bcrypt.hash(request.body.password , 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        response.status(200).json({ 
            message: "Password reset successfully!" ,
            success: true
        });
    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!" })
    }
}