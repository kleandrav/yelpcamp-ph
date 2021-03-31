// import modules
const express = require('express');
// express router
const router = express.Router();
// import models
const Campground = require('../models/campground');
//import utilities
const {requireLogIn, isCampAuthor, validateCamp} = require('../utils/middleware.js');
const catchAsync = require('../utils/catchAsync.js');

// Show All (campgrounds) route
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    // console.log(campgrounds);
    res.render('campgrounds/index', {campgrounds});
}));

// Create (campground) routes
router.get('/new', requireLogIn, async (req, res) => {
    res.render('campgrounds/new');
});
router.post('/', requireLogIn, validateCamp, catchAsync(async (req, res, next) => {
    try {      
        const camp = new Campground(req.body);
        camp.author = req.user._id;
        console.log('New Camp:', camp);
        // res.send(req.body);
        await camp.save();
        req.flash('success', `Saved a new campground: ${camp.name}`);
        res.redirect(`/campgrounds/${camp._id}`);
    }
    catch (e) {
        next(e);
    }
}));

// Show 1 (campground) route
router.get('/:id', catchAsync(async (req, res) => {
    // console.log(req.params);
    const camp = await Campground.findById(req.params.id).populate({
        path: 'reviews', // populate reviews for each campground
        populate: { path: 'author' } // populate author of each review
    }).populate('author'); // populate author of each campground

    if (!camp)
    {
        req.flash('error', `Cannot find that campground. Either it was already deleted or the Id in the URL is incorrect.`);
        return res.redirect('/campgrounds');
    }
    // console.log('Showing Up:', camp);

    res.render('campgrounds/show', {camp});
}));

// Update (campground) routes
router.get('/:id/edit', requireLogIn, isCampAuthor, catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    if (!camp)
    {
        req.flash('error', `We cannot find that campground. It could already be deleted, or maybe the ID in the URL is incorrect.`);
        return res.redirect('/campgrounds');
    }
    res.render(`campgrounds/edit`, {camp})
}));
router.put('/:id', requireLogIn, isCampAuthor, validateCamp, catchAsync(async (req, res) => {
    await Campground.findByIdAndUpdate(req.params.id, req.body);
    req.flash('success', `Successfully edited ${req.body.name}.`);
    res.redirect(`/campgrounds/${req.params.id}`);
}));

// Delete (campground) route 
router.delete('/:id', requireLogIn, isCampAuthor, catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', `Successfully deleted the campground.`);
    res.redirect('/campgrounds');
}));


module.exports = router;