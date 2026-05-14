const mongoose = require("mongoose");
const { Types } = mongoose;

const commentSchema = new mongoose.Schema({
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },

    postId: {
        type: Types.ObjectId,
        ref: "Post",
        required: true
    },

    text: {
        type: String,
        required: true
    } ,

    parentComment: {
        type: Types.ObjectId,
        ref: "Comment" ,
        default: null
    }
} , {timestamps: true})

module.exports = mongoose.model("Comment" , commentSchema)