// Controllers for Campground Routes

// models
const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    for (let camp of campgrounds)
    {
        let x = Math.floor(Math.random() * camp.images.length);
        camp.image = camp.images[x].url;
        console.log(x, camp.image)
    }
    res.render('campgrounds/index', {campgrounds});
};

module.exports.newForm = async (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCamp = async (req, res, next) => {
    try {      
        const camp = new Campground(req.body);
        camp.author = req.user._id;
        camp.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        console.log('New Camp:', camp);
        // res.send(req.body);
        await camp.save();
        req.flash('success', `Saved a new campground: ${camp.name}`);
        res.redirect(`/campgrounds/${camp._id}`);
    }
    catch (e) {
        next(e);
    }
};

module.exports.showCamp = async (req, res) => {
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
};

module.exports.editForm = async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    if (!camp)
    {
        req.flash('error', `We cannot find that campground. It could already be deleted, or maybe the ID in the URL is incorrect.`);
        return res.redirect('/campgrounds');
    }
    res.render(`campgrounds/edit`, {camp})
};

module.exports.updateCamp = async (req, res) => {
    await Campground.findByIdAndUpdate(req.params.id, req.body);
    req.flash('success', `Successfully edited ${req.body.name}.`);
    res.redirect(`/campgrounds/${req.params.id}`);
};

module.exports.deleteCamp = async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', `Successfully deleted the campground.`);
    res.redirect('/campgrounds');
};
