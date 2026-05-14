const Joi = require("joi");

const updateProfileSchema = Joi.object({
    username: Joi.string().min(3).max(30).optional(),
    bio: Joi.string().max(200).allow("").optional(),
    profilePicture: Joi.string().allow("").optional(),
    email: Joi.string().email().optional()
})

module.exports = {
    updateProfileSchema
}