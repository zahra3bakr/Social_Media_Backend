const User = require("../models/userModel")
const Post = require("../models/postModel")

exports.searchUsers = async (request , response ) => {
    try {
        const {query} = request.query

        if(!query) return response.status(400).json({message: "Search query is required!"})

        const users = await User.find({
            $or: [
                {username: {$regex: query , $options: "i"}},
                {name: {$regex: query , $options: "i"}}
            ]
        }).select("username name profilePicture")

        response.status(200).json({success: true , users})
    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Internal Server Error!"})
    }
}

exports.searchPosts = async (request , response ) => {
    try {
        const {query} = request.query

        if(!query) return response.status(400).json({ message : "Search query is required!"})

        const posts = await Post.find({
            $or: [
                {content : {$regex: query , $options: "i"}} ,
                {tags: {$in: [new RegExp(query, "i")]}}
            ]
        }).populate("userId" , "username profilePicture")

        response.status(200).json({success: true , posts})
    } catch (error) {
        console.log(error)
        response.status(500).json({message: "Internal Server Error!"})
    }
}