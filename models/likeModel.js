const  {mongoose, Types}  = require("mongoose");

const likeSchema = new mongoose.Schema({
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
} , {timestamps: true})

module.exports = mongoose.model("Like" , likeSchema)