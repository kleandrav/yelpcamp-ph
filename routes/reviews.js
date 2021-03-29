// import modules
const express = require('express');

// express router
const router = express.Router({mergeParams: true});

// import models
const Campground = require('../models/campground');
const Review = require('../models/review');

//import utilities
const ExpressError = require('../utils/ExpressError.js')
const catchAsync = require('../utils/catchAsync.js')
const { joiReview } = require('../joiSchemas.js');

// Joi Validation
const validateReview = (req, res, next) => {    
    const {error} = joiReview.validate(req.body);    
    if (error)    {
        console.log('error:', req.body);
        const msg = error.details.map(err => err.message).join(', ');
        throw new ExpressError(400, msg);
    }
    else    {
        next();
    }
}

// Create (review) route
router.post('/', validateReview, catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    console.log('New Review:', review);
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
}));

// Delete (review) route
router.delete('/:reviewId', catchAsync( async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate( id, { $pull: { reviews: reviewId }});
    await Review.findOneAndDelete(reviewId);
    res.redirect(`/campgrounds/${req.params.id}`);
}))


module.exports = router;