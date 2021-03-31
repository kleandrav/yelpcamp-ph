const Joi = require('joi');

const joiCamp = Joi.object({
    name: Joi.string().required(),
    price: Joi.number().required().min(0),
    image: Joi.string().required(),
    location: Joi.string().required(),
    description: Joi.string().required()
});

const joiReview = Joi.object({
    review: Joi.object({
        body: Joi.string().required(),
        rating: Joi.number().required().min(1).max(5)
    }).required()
})

module.exports.joiCamp = joiCamp;
module.exports.joiReview = joiReview;