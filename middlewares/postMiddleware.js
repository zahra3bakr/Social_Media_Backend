const postModel = require("../models/postModel")

const isPostOwner = async (request , response , next) => {
    try {
        const post = await postModel.findById(request.params.id)

        if (!post) {
            return response.status(404).json({message: "Post not found!"})
        }

        if(post.userId && post.userId.toString() !== request.user.id) {
            return response.status(403).json({message: "Unauthorized!"})
        }

        next()


    } catch (error) {
        console.log(error)
        response.status(500).json({ message: "Inernal Server Error!"})
    }
}

module.exports = {isPostOwner}