const Joi = require("joi");

// Login Schema 
const loginSchema = Joi.object({
    email : Joi.string().min(3).max(100).required() ,
    password: Joi.string().min(6).max(50).required()
})

// Register Schema 
const registerSchema = Joi.object({
    email: Joi.string().min(3).max(100).required(),
    password: Joi.string().min(6).max(50).required(),
    username: Joi.string().min(3).max(50).trim(),
});



module.exports = {loginSchema , registerSchema}