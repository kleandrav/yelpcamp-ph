const Campground = require('../models/campground');
const ExpressError = require('../utils/ExpressError');
const {
    cloudinary
} = require("../cloudinary");
const shuffle = require('array-shuffle');
// const { getLastUpdated, capitalize } = require('../utils/functions');

// Geocoding
// To create a service client, import the service's factory function from '@mapbox/mapbox-sdk/services/{service}' and provide it with your access token.
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { AggregationCursor } = require('mongoose');
const mbxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({
    accessToken: mbxToken
});

module.exports.index = async (req, res, next) => {
    let currentPage = Number(req.query.page);
    console.log({
        currentPage
    });

    if (!currentPage || currentPage < 1)
    // if client req /index w/o ?page 
    {
        currentPage = 1;
        // get campgrounds from the database
        req.session.campgrounds = await Campground.find({}).limit(1000);

        // Initialize Pagination
        let len = (req.session.campgrounds).length;
        req.session.pagination = {
            totalItems: len, // total # of campgrounds
            itemsPerPage: 20,
            totalPages: Math.ceil(len / 20) // total # of pages
        }
    }

    if (!req.session.pagination || !req.session.campgrounds) res.redirect('campgrounds/');

    const {
        itemsPerPage,
        totalItems,
        totalPages
    } = req.session.pagination;
    let start = (currentPage - 1) * itemsPerPage;
    let end = currentPage * itemsPerPage;
    if (end > totalItems) end = totalItems;

    const campgrounds = (req.session.campgrounds);
    res.render('campgrounds/', {
        campgrounds,
        totalPages,
        currentPage,
        start,
        end
    });
};

module.exports.search = async (req, res) => {
    const searchTerm = req.query.q ? (req.query.q).match(/\w+/g).join(' ') : "";
    console.log(searchTerm);

    const campgrounds = shuffle(await Campground.find({
        $text: {
            $search: searchTerm
        }
    }));

    res.render('campgrounds/search', {
        searchTerm,
        campgrounds
    });
};

module.exports.newForm = async (req, res) => {
    res.render('campgrounds/new');
};

module.exports.createCamp = async (req, res, next) => {
    try {
        const camp = new Campground(req.body);

        const geoData = await geocoder.forwardGeocode({
            query: camp.location,
            limit: 1
        }).send();

        camp.geometry = geoData.body.features[0].geometry;
        console.log(camp.geometry);

        camp.author = req.user._id;
        camp.images = req.files.map(f => ({
            url: f.path,
            filename: f.filename
        }));
        camp.lastUpdated = Date.now();

        console.log('New Camp:', camp);
        await camp.save();

        req.flash('success', `Saved a new campground: ${camp.name}`);
        res.redirect(`/campgrounds/${camp._id}`);
    } catch (e) {
        next(e);
    }
};

module.exports.showCamp = async (req, res) => {
    const camp = await Campground.findById(req.params.id).populate({
        path: 'reviews', // populate reviews for each campground
        populate: {
            path: 'author'
        } // populate author of each review
    }).populate('author'); // populate author of each campground
    if (!camp) {
        req.flash('error', `Cannot find that campground. Either it was already deleted or the Id in the URL is incorrect.`);
        return res.redirect('/campgrounds');
    }    
    // let author = capitalize( camp.author.username );
    // let updated; // how many days ago when the camp was last updated
    // if (camp.lastUpdated) updated = getLastUpdated( camp.lastUpdated );
    // // how many days ago when the Review was posted & also to 
    // const reviews = camp.reviews.map
    res.render('campgrounds/show', { camp });
};

module.exports.editForm = async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    if (!camp) {
        req.flash('error', `We cannot find that campground. It could already be deleted, or maybe the ID in the URL is incorrect.`);
        return res.redirect('/campgrounds');
    }
    res.render(`campgrounds/edit`, {
        camp
    })
};

module.exports.updateCamp = async (req, res) => {
    const {
        id
    } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, {
        ...req.body
    });

    const newLocation = req.body.location;
    console.log({
        newLocation
    });

    // If Location was changed
    if (newLocation !== camp.location) {
        const geoData = await geocoder.forwardGeocode({
            query: newLocation,
            limit: 1
        }).send();
        camp.geometry = geoData.body.features[0].geometry;
        console.log(camp.geometry);
    }

    // New images to Add
    if (req.files.length) {
        console.log('Adding new images:', req.files);
        const images = req.files.map(img => ({
            url: img.path,
            filename: img.filename
        }));
        camp.images.push(...images);
    }

    camp.lastUpdated = Date.now();
    await camp.save();

    // Images to Delete
    const deletables = req.body.deleteImages;
    if (deletables) {
        for (let fileName of deletables) {
            await cloudinary.uploader.destroy(fileName);
            console.log('Destroyed: ', fileName);
        }

        await camp.updateOne({
            $pull: {
                images: {
                    filename: {
                        $in: deletables
                    }
                }
            }
        });

        console.log('DELETED:', deletables);
    }

    req.flash('success', `Successfully edited ${ camp.name }.`);
    res.redirect(`/campgrounds/${ id }`);
};

module.exports.deleteCamp = async (req, res) => {
    const {
        id
    } = req.params;
    console.log('deleting ID:', id);

    const camp = await Campground.findById(id);

    // console.log('DELETING:', camp);

    for (let img of camp.images) {
        await cloudinary.uploader.destroy(img.filename);
        console.log('Destroyed:', img.filename);
    }

    await Campground.findByIdAndDelete(id);
    req.flash('success', `Successfully deleted the campground.`);
    res.redirect('/campgrounds');
};