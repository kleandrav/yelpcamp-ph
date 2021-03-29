// import modules
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const morgan = require('morgan');

// express app
const app = express();

// import models
const Campground = require('./models/campground');
const Review = require('./models/review');

//import utilities
const ExpressError = require('./utils/ExpressError.js')
const catchAsync = require('./utils/catchAsync.js')
const { joiCamp, joiReview } = require('./joiSchemas.js');

// import routes 
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

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
        error = joiReview.validate(req.body).error;

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

// Campground Routes
app.use('/campgrounds', campgroundRoutes);

// Reviews Routes
app.use('/campgrounds/:id/reviews', reviewRoutes)

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
