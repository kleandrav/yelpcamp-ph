// import modules
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const morgan = require('morgan');

// import models
const Campground = require('./models/campground');
const Review = require('./models/review');

//import utilities
const ExpressError = require('./utils/ExpressError.js')
const catchAsync = require('./utils/catchAsync.js')
const { joiCamp, joiReview } = require('./joiSchemas.js');
const campground = require('./models/campground');

// express app
const app = express();

// connect mongoose to mongodb
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Database Connected!'))
    .catch(err => console.log('Mongoose Connection Error:', err));

// ejs-mate
app.engine('ejs', ejsMate);

// setup EJS & views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// parse req.body from a form POST request
app.use(express.urlencoded({extended: true}));
// method override for put / delete request
app.use(methodOverride('_method'));

// Morgan
app.use(morgan('tiny'));

// Joi Validations
const validateByJoi = (req, res, next) => {
    
    // const {error} = joiCamp.validate(req.body);
    console.log('path:', req.path);
    let error;
    if (req.path == '/campgrounds')
        error = joiCamp.validate(req.body).error;
    else if (req.path == '/campgrounds/:id/reviews')
        error = joiCamp.validate(req.body).error;

    if (error)
    {
        console.log('error:', req.body);
        const msg = error.details.map(err => err.message).join(', ');
        throw new ExpressError(400, msg);
    }
    else
    {
        next();
    }
}

// Home Page
app.get('/', (req, res) => {
    res.render('home');
});

// Show All (campgrounds) route
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    // console.log(campgrounds);
    res.render('campgrounds/index', {campgrounds});
}));

// Create (campground) routes
app.get('/campgrounds/new', async (req, res) => {
    res.render('campgrounds/new');
});
app.post('/campgrounds', validateByJoi, catchAsync(async (req, res, next) => {
    try {      
        const camp = new Campground(req.body);
        console.log('New Camp:', camp);
        // res.send(req.body);
        await camp.save();
        res.redirect(`/campgrounds/${camp._id}`);
    }
    catch (e) {
        next(e);
    }
}));

// Show 1 (campground) route
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    // console.log(req.params);
    const camp = await Campground.findById(req.params.id).populate('reviews');
    console.log('Showing Up:', camp);
    res.render('campgrounds/show', {camp});
}));

// Update (campground) routes
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    res.render(`campgrounds/edit`, {camp})
}));
app.put('/campgrounds/:id', validateByJoi, catchAsync(async (req, res) => {
    // res.send(req.body);
    // const camp = await Campground.findByIdAndUpdate(req.params.id, req.body, {new: true});
    // console.log('Updated Camp:', camp)
    await Campground.findByIdAndUpdate(req.params.id, req.body);
    res.redirect(`/campgrounds/${req.params.id}`);
}));

// Delete (campground) route 
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
}));

// Create (review) route
app.post('/campgrounds/:id/reviews', validateByJoi, catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    console.log('New Review:', review);
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
}));

// Delete (review) route
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync( async (req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate( id, { $pull: { reviews: reviewId }});
    await Review.findOneAndDelete(reviewId);
    res.redirect(`/campgrounds/${req.params.id}`);
}))

// 404
app.all('*', (req, res, next) => {
    next( new ExpressError(404, 'Page Not Found'));
});

// simple error handler
app.use((err, req, res, next) => {
    if(!err.status) err.status = 400;
    if(!err.message) err.message = 'Something went wrong';
    res.render('error', {err});
});

app.listen(8080, () => {
    console.log("Server's open on port 8080")
});
