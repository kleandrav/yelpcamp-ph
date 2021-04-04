// Controllers for Campground Routes

// models
const Campground = require('../models/campground');
const { cloudinary } = require("../cloudinary");
const campground = require('../models/campground');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    for (let camp of campgrounds)
    {
        let x = Math.floor(Math.random() * camp.images.length);
        camp.image = camp.images[x].url;
        // console.log(x, camp.image)
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
        await camp.save();

        req.flash('success', `Saved a new campground: ${camp.name}`);
        res.redirect(`/campgrounds/${camp._id}`);
    }
    catch (e) {
        next(e);
    }
};

module.exports.showCamp = async (req, res) => {
    const camp = await Campground.findById(req.params.id).populate({
        path: 'reviews', // populate reviews for each campground
        populate: { path: 'author' } // populate author of each review
    }).populate('author'); // populate author of each campground

    if (!camp)
    {
        req.flash('error', `Cannot find that campground. Either it was already deleted or the Id in the URL is incorrect.`);
        return res.redirect('/campgrounds');
    }

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
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body });

    // New images to Add
    if ( req.files.length )
    {
        console.log('Adding new images:', req.files);
        const images = req.files.map( img => ({ url: img.path, filename: img.filename }));
        camp.images.push( ...images );
        await camp.save();
    }

    // Images to Delete
    const deletables = req.body.deleteImages;
    if ( deletables )
    {
        for (let fileName of deletables )
        {
            await cloudinary.uploader.destroy( fileName );
            console.log( 'Destroyed: ', fileName );
        }

        await camp.updateOne({
            $pull: { images: { filename: { $in: deletables }}}
        });

        console.log('DELETED:', deletables);
    }

    req.flash('success', `Successfully edited ${ camp.name }.`);
    res.redirect(`/campgrounds/${ id }`);
};

module.exports.deleteCamp = async (req, res) => {
    const { id } = req.params;
    console.log('deleting ID:', id);

    const camp = await Campground.findById( id );

    // console.log('DELETING:', camp);

    for (let img of camp.images)
    {
        await cloudinary.uploader.destroy( img.filename );
        console.log( 'Destroyed:', img.filename );
    }
    
    await Campground.findByIdAndDelete( id );
    req.flash('success', `Successfully deleted the campground.`);
    res.redirect('/campgrounds');
};
