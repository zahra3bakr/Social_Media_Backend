const Joi = require("joi");

// Create
const createPostSchema = Joi.object({
    content: Joi.string().min(1).max(1000).required() ,

    image: Joi.string().allow("").optional() ,
}) 

// Update
const updatePostSchema = Joi.object({
    content: Joi.string().min(1).max(1000),
    image: Joi.string().allow(""),
});

// Comment
const createCommentSchema = Joi.object({
    text: Joi.string().min(1).max(500).required() ,
    parentComment: Joi.string().hex().length(24).optional()
})

module.exports = {
    createPostSchema , 
    createCommentSchema , 
    updatePostSchema
}