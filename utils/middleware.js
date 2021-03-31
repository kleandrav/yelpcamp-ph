const ExpressError = require('./ExpressError.js');
const { joiCamp, joiReview } = require('./joiSchemas.js');
const Campground = require('../models/campground');
const Review = require('../models/review');
const catchAsync = require('../utils/catchAsync.js');

// Joi Validation
module.exports.validateCamp = (req, res, next) => {    
    const {error} = joiCamp.validate(req.body);    
    if (error)    {
        console.log('error:', req.body);
        const msg = error.details.map(err => err.message).join(', ');
        throw new ExpressError(400, msg);
    }
    else    {
        next();
    }
}

// Joi Validation
module.exports.validateReview = (req, res, next) => {    
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

// checks if user is logged in
module.exports.requireLogIn = (req, res, next) => {
    if (!req.isAuthenticated())
    {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

// checks if authorized
module.exports.isCampAuthor = catchAsync( async (req, res, next) => {
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if (!camp.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
});

// checks if authorized
module.exports.isReviewAuthor = catchAsync( async (req, res, next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
});
