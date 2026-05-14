const { mongoose, Types } = require("mongoose");

const postSchema = new mongoose.Schema({
    userId: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },

    content: {
        type: String,
        required: [true , "Content cannot be empty!"] ,
        trim: true
    },

    image: {
        type: String,
        default: ""
    },

    likesCount: {
        type: Number,
        default: 0
    },

    commentsCount: {
        type: Number,
        default: 0
    },
    tags: {
        type: [String],
        default: []
    }
} ,  { timestamps: true})

module.exports = mongoose.model("Post" , postSchema)