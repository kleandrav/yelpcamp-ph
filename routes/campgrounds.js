// import modules
const express = require('express');

// express router
const router = express.Router();

// import models
const Campground = require('../models/campground');

//import utilities
const {requireLogIn} = require('../utils/middleware.js');
const ExpressError = require('../utils/ExpressError.js');
const catchAsync = require('../utils/catchAsync.js');
const { joiCamp } = require('../joiSchemas.js');

// Joi Validation
const validateCamp = (req, res, next) => {    
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
    const camp = await Campground.findById(req.params.id).populate('reviews');
    if (!camp)
    {
        req.flash('error', `Cannot find that campground. Either it was already deleted or the Id in the URL is incorrect.`);
        return res.redirect('/campgrounds');
    }
    // console.log('Showing Up:', camp);
    res.render('campgrounds/show', {camp});
}));

// Update (campground) routes
router.get('/:id/edit', requireLogIn, catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    if (!camp)
    {
        req.flash('error', `We cannot find that campground. It could already be deleted, or maybe the ID in the URL is incorrect.`);
        return res.redirect('/campgrounds');
    }
    res.render(`campgrounds/edit`, {camp})
}));
router.put('/:id', requireLogIn, validateCamp, catchAsync(async (req, res) => {
    await Campground.findByIdAndUpdate(req.params.id, req.body);
    req.flash('success', `Successfully edited ${req.body.name}.`);
    res.redirect(`/campgrounds/${req.params.id}`);
}));

// Delete (campground) route 
router.delete('/:id', requireLogIn, catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', `Successfully deleted the campground.`);
    res.redirect('/campgrounds');
}));


module.exports = router;