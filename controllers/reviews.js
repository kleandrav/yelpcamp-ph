// import models
const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    review.lastUpdated = Date.now();
    console.log('New Review:', review);
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    req.flash('success', `Successfully added a review.`);
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate( id, { $pull: { reviews: reviewId }});
    await Review.findOneAndDelete(reviewId);
    req.flash('success', `Successfully deleted the review.`);
    res.redirect(`/campgrounds/${req.params.id}`);
}
