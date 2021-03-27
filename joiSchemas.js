const Joi = require('joi');

const joiCamp = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().required()
});

module.exports.joiCamp = joiCamp;