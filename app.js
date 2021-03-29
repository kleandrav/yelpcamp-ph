// import modules
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');

// express app
const app = express();

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
    useUnifiedTopology: true,
    useFindAndModify: false
})
    .then(() => console.log('Database Connected!'))
    .catch(err => console.log('Mongoose Connection Error:', err));

// ejs-mate
app.engine('ejs', ejsMate);

// setup EJS
app.set('view engine', 'ejs');

// directories
app.set('views', path.join(__dirname, 'views'));
app.use(express.static( path.join(__dirname, 'public')));

// parse req.body from a form POST request
app.use(express.urlencoded({extended: true}));

// method override for put / delete request
app.use(methodOverride('_method'));

// Morgan
app.use(morgan('tiny'));

// Express Session & Flash
const sessionConfig = {
    secret: 'yourdeepestdarkestsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // session expires in 15 days:
        expires: Date.now() + 1000 * 60 * 60 * 24 * 15, 
        maxAge: 1000 * 60 * 60 * 24 * 15
    }
}
app.use( session( sessionConfig ));
app.use( flash() ); // flash middleware

app.use( (req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

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
    next( new ExpressError( 404, 'Page Not Found' ));
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
