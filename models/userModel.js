const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username:{
        type:String
    },

    email: {
        type:String , 
        required: true , 
        unique: true
    },

    password: {
        type:String ,
        required: true
    },

    profilePicture: {
        type:String , 
        default: ''
    },
    
    bio:{
        type:String , 
        default: ''
    },

    accountStatus:{
        type:String , 
        enum: ['Active', 'Suspended', 'Deleted'], 
        default: 'Active'
    },

    resetPasswordToken : String ,

    resetPasswordExpire: Date ,

    followers: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User"
        }
    ] ,

    following: [
        {
            type: mongoose.Types.ObjectId,
            ref: "User"
        }
    ]
    
} , {timestamps: true})

module.exports = mongoose.model('User' , userSchema)