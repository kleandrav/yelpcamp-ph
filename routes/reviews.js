// import modules
const express = require('express');

// express router
const router = express.Router({mergeParams: true});

// import models
const Campground = require('../models/campground');
const Review = require('../models/review');

//import utilities
const catchAsync = require('../utils/catchAsync.js');
const { validateReview, requireLogIn, isReviewAuthor } = require('../utils/middleware.js');

// Create (review) route
router.post('/', requireLogIn, validateReview, catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    console.log('New Review:', review);
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    req.flash('success', `Successfully added a review.`);
    res.redirect(`/campgrounds/${camp._id}`);
}));

// Delete (review) route
router.delete('/:reviewId', requireLogIn, isReviewAuthor, catchAsync( async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate( id, { $pull: { reviews: reviewId }});
    await Review.findOneAndDelete(reviewId);
    req.flash('success', `Successfully deleted the review.`);
    res.redirect(`/campgrounds/${req.params.id}`);
}))


module.exports = router;