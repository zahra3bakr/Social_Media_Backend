const Joi = require("joi");

const sendMessageSchema = Joi.object({
    message: Joi.string().min(1).required()
})

module.exports = {
    sendMessageSchema
}